
function goHome() {
  window.location.href = "index.html";
}

function openReadingList() {
  window.location.href = "mybooks.html?mode=reading";
}

function openPlanList() {
  window.location.href = "mybooks.html?mode=plan";
}
function toggleTools() {
  const extra = document.getElementById("settingsFooter");
  extra.classList.toggle("show");
}
function openFinishedList() {
  window.location.href = "mybooks.html?mode=finished";
}

function openBook(workKey) {
  window.location.href = `book.html?id=${workKey}`;
}
function toggleSettings() {
  const panel = document.getElementById("settingsFooter");
  panel.classList.toggle("show");
  updateFontButtons();
}
function handleSearch(e) {
  if (e.key === "Enter") {
    startSearch();
  }
}
function startSearch() {
  const term = document.getElementById("searchInput").value.trim();
  if (term.length === 0) return;

  window.location.href = `search.html?query=${encodeURIComponent(term)}`;
}



let fontLevel = parseInt(sessionStorage.getItem("fontLevel")) || 1;

applyFontSize();
updateFontButtons();
function increaseFont() {
  if (fontLevel < 2) {
    fontLevel++;
    sessionStorage.setItem("fontLevel", fontLevel);
    applyFontSize();
    updateFontButtons();
  }
}

function decreaseFont() {
  if (fontLevel > 0) {
    fontLevel--;
    sessionStorage.setItem("fontLevel", fontLevel);
    applyFontSize();
    updateFontButtons();
  }
}

function applyFontSize() {
  const root = document.documentElement;

  if (fontLevel === 0) {
    root.style.fontSize = "14px";
  } else if (fontLevel === 1) {
    root.style.fontSize = "16px";
  } else if (fontLevel === 2) {
    root.style.fontSize = "20px";
  }
}

function updateFontButtons() {
  document.getElementById("increaseFontBtn").disabled = fontLevel === 2;
  document.getElementById("decreaseFontBtn").disabled = fontLevel === 0;
}



let iconsVisible = sessionStorage.getItem("iconsVisible") === "true";
let searchFocused = false;
let enableNavigation = false;
let selectedIndex = 0;

window.addEventListener("DOMContentLoaded", () => {
    updateIcons();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("focus", () => searchFocused = true);
        searchInput.addEventListener("blur", () => searchFocused = false);
    }

    if (iconsVisible) {
        enableNavigation = true;
        selectFirstItem();
    }
    updateBackButtonVisibility();
});

document.addEventListener("keydown", function (e) {
    const key = e.key;

    if (key === "Escape") {
      if (searchFocused) {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.blur();
        searchFocused = false;
        return;
      }
      
      iconsVisible = !iconsVisible;
      sessionStorage.setItem("iconsVisible", iconsVisible);
      updateIcons();
      
      enableNavigation = iconsVisible;
      
      if (enableNavigation) selectFirstItem();
      else 
        clearSelection();
      
      updateBackButtonVisibility();
      return;
    }

    if (key === " ") {

        if (searchFocused) {
            return;
        }
        e.preventDefault();
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.focus();
        return;
    }

    if (enableNavigation) {
        if (key === "ArrowRight") return moveSelection(1);
        if (key === "ArrowLeft") return moveSelection(-1);
        if (key === "ArrowDown") {
            const cols = getColumnCount();
            return moveSelection(cols);
        }

        if (key === "ArrowUp") {
            const cols = getColumnCount();
            return moveSelection(-cols);
        }
        if (key === "Enter") return activateSelectedItem();
        if (enableNavigation && (key === "ArrowDown" || key === "ArrowUp")) {
          e.preventDefault();
    }
    }
    if (iconsVisible && enableNavigation && e.key === "Backspace") {
      e.preventDefault();
      history.back();
      return;
      }
    if (key === "0") return window.location.href = "index.html";
    if (key === "1") return openPlanList();
    if (key === "2") return openReadingList();
    if (key === "3") return openFinishedList();
});

function updateIcons() {
    document.querySelectorAll(".btn-icons").forEach(icon => {
        icon.style.opacity = iconsVisible ? "1" : "0";
    });

    document.querySelector(".search-icon").style.opacity =
        iconsVisible ? "1" : "0";

    document.querySelector(".header-actions")
        .classList.toggle("icons-visible", iconsVisible);
    document.querySelector(".home-btn-icon").style.opacity =
        iconsVisible ? "1" : "0";
}



function getItems() {
    return document.querySelectorAll(".nav-item");
}
function selectFirstItem() {
    const items = getItems();
    if (items.length === 0) return;

    selectedIndex = 0;
    updateSelection();
}
function moveSelection(step) {
    const items = document.querySelectorAll(".nav-item");
    if (!items.length) return;

    selectedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + step));

    updateSelection();
    scrollSelectedItemIntoView();
}
function updateSelection() {
    const items = getItems();

    items.forEach((item, index) => {
        item.classList.toggle("selected", index === selectedIndex);
    });

    items[selectedIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    });
}
function clearSelection() {
    getItems().forEach(item => item.classList.remove("selected"));
}
function activateSelectedItem() {
    const items = getItems();
    if (!items[selectedIndex]) return;

    items[selectedIndex].click();
}

function scrollSelectedItemIntoView() {
    const container =
        document.querySelector("#booksGrid") ||
        document.querySelector("#resultsGrid") ||
        document.querySelector(".grid-container") ||
        document.body;

    const items = document.querySelectorAll(".nav-item");
    if (!items.length) return;

    const item = items[selectedIndex];
    if (!item) return;

    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (itemRect.top < containerRect.top) {
        container.scrollTop -= (containerRect.top - itemRect.top) + 20;
    } else if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += (itemRect.bottom - containerRect.bottom) + 20;
    }
}

function getColumnCount() {
    const items = document.querySelectorAll(".nav-item");
    if (items.length < 2) return 1;

    const firstTop = items[0].getBoundingClientRect().top;
    let count = 1;

    for (let i = 1; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top !== firstTop) break;
        count++;
    }

    return count;
}


function updateBackButtonVisibility() {
    const backBtn = document.querySelector(".back-btn");
    if (!backBtn) return;

    const canGoBack = document.referrer !== "" || window.history.length > 1;

    if (enableNavigation && canGoBack) {
        backBtn.style.display = "block";
    } else {
        backBtn.style.display = "none";
    }
}