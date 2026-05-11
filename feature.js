
document.querySelector(".sidebar-toggle").addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("open");
});
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



let fontLevel = sessionStorage.getItem("fontLevel");
fontLevel = fontLevel !== null ? parseInt(fontLevel) : 0;

applyFontSize();
updateFontButtons();
updateFontSlider();

function increaseFont() {
  if (fontLevel < 2) {
    fontLevel++;
    sessionStorage.setItem("fontLevel", fontLevel);
    applyFontSize();
    updateFontButtons();
    updateFontSlider();
  }
}

function decreaseFont() {
  if (fontLevel > 0) {
    fontLevel--;
    sessionStorage.setItem("fontLevel", fontLevel);
    applyFontSize();
    updateFontButtons();
    updateFontSlider();
  }
}

document.getElementById("fontSlider").addEventListener("input", function () {
  fontLevel = parseInt(this.value);
  sessionStorage.setItem("fontLevel", fontLevel);
  applyFontSize();
  updateFontButtons();
});

function applyFontSize() {
  const root = document.documentElement;

  if (fontLevel === 0) {
    root.style.fontSize = "1rem";
  } else if (fontLevel === 1) {
    root.style.fontSize = "1.2rem";
  } else if (fontLevel === 2) {
    root.style.fontSize = "1.5rem";
  }
}


function updateFontButtons() {
  document.getElementById("increaseFontBtn").disabled = fontLevel === 2;
  document.getElementById("decreaseFontBtn").disabled = fontLevel === 0;
}

function updateFontSlider() {
  document.getElementById("fontSlider").value = fontLevel;
}







const dyslexiaBtn = document.getElementById("dyslexiaToggleBtn");
const dyslexiaToggle = document.getElementById("dyslexiaToggle");
let dyslexiaMode = sessionStorage.getItem("dyslexiaActive") === "true";

if (dyslexiaMode) {
  applyDyslexiaMode();
  document.body.classList.add("dyslexia-mode");
  if (dyslexiaToggle) dyslexiaToggle.checked = true;
  if (dyslexiaBtn) dyslexiaBtn.classList.add("active");
}


if (dyslexiaToggle) {
  dyslexiaToggle.addEventListener("change", () => {
    dyslexiaMode = dyslexiaToggle.checked;
    sessionStorage.setItem("dyslexiaActive", dyslexiaMode);

    if (dyslexiaMode) {
      applyDyslexiaMode();
      document.body.classList.add("dyslexia-mode");
      if (dyslexiaBtn) dyslexiaBtn.classList.add("active");
    } else {
      removeDyslexiaMode();
      document.body.classList.remove("dyslexia-mode");
      if (dyslexiaBtn) dyslexiaBtn.classList.remove("active");
    }
  });
}
if (dyslexiaBtn) {
  dyslexiaBtn.addEventListener("click", () => {
    dyslexiaMode = !dyslexiaMode;
    sessionStorage.setItem("dyslexiaActive", dyslexiaMode);

    if (dyslexiaMode) {
      applyDyslexiaMode();
      document.body.classList.add("dyslexia-mode");
      dyslexiaBtn.classList.add("active");
      if (dyslexiaToggle) dyslexiaToggle.checked = true;
    } else {
      removeDyslexiaMode();
      document.body.classList.remove("dyslexia-mode");
      dyslexiaBtn.classList.remove("active");
      if (dyslexiaToggle) dyslexiaToggle.checked = false;
    }
  });
}
function applyDyslexiaMode() {
  document.body.style.background = "#fdf6e3";
  document.body.style.lineHeight = "1.8";
  document.body.style.wordSpacing = "1.5";

  fontLevel = 1;
  sessionStorage.setItem("fontLevel", 1);
  applyFontSize();
  updateFontButtons();
  updateFontSlider();
}

function removeDyslexiaMode() {
  document.body.style.background = "";
  document.body.style.lineHeight = "";

  applyFontSize();
  updateFontButtons();
  updateFontSlider();
}



/*
let darkMode = sessionStorage.getItem("darkModeActive") === "true";
const darkBtn = document.getElementById("darkModeToggleBtn");

if (darkMode) {
  document.body.classList.add("dark-mode");
  darkBtn.classList.add("active");
}
darkBtn.addEventListener("click", () => {
  darkMode = !darkMode;
  sessionStorage.setItem("darkModeActive", darkMode);

  if (darkMode) {
    document.body.classList.add("dark-mode");
    darkBtn.classList.add("active");
  } else {
    document.body.classList.remove("dark-mode");
    darkBtn.classList.remove("active");
  }
});
*/





document.querySelectorAll(".swatch").forEach(swatch => {
    const color = swatch.dataset.color;
    swatch.style.backgroundColor = color;
});

document.querySelectorAll(".color-swatches .swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
        const color = swatch.dataset.color;
        const target = swatch.parentElement.dataset.target;

        document.documentElement.style.setProperty(target, color);
        sessionStorage.setItem(target, color);
    });
});

["--primary-color", "--secondary-color"].forEach(variable => {
    const saved = sessionStorage.getItem(variable);
    if (saved) {
        document.documentElement.style.setProperty(variable, saved);
    }
});



let ttsEnabled = false;
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("ttsToggle");
    if (toggle) {
        if (sessionStorage.getItem("ttsEnabled") === "true") {
            ttsEnabled = true;
            toggle.checked = true;
        }

        toggle.addEventListener("change", e => {
            ttsEnabled = e.target.checked;
            sessionStorage.setItem("ttsEnabled", ttsEnabled);
        });
    attachSpeakEvents();
    }
});
function stopSpeech() {
    window.speechSynthesis.cancel();
}

function speak(text) {
    if (!ttsEnabled) return;

    stopSpeech();
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1;
    msg.pitch = 1;
    msg.volume = 1;
    speechSynthesis.speak(msg);
}
function attachSpeakEvents() {
    document.querySelectorAll(".speak").forEach(el => {
        el.addEventListener("mouseenter", () => {
            const text = el.dataset.say;
            if (text) speak(text);
        });
        el.addEventListener("mouseleave", stopSpeech);
    });
}

const wordSpacingSlider = document.getElementById("wordSpacingSlider");

if (wordSpacingSlider) {
  wordSpacingSlider.addEventListener("input", () => {
    const spacing = wordSpacingSlider.value + "px";
    document.body.style.wordSpacing = spacing;
    sessionStorage.setItem("wordSpacing", spacing);
  });
  const savedSpacing = sessionStorage.getItem("wordSpacing");
  if (savedSpacing) {
    document.body.style.wordSpacing = savedSpacing;
    wordSpacingSlider.value = parseInt(savedSpacing);
  }
}



const letterSpacingSlider = document.getElementById("letterSpacingSlider");
const letterSpacingBtn = document.getElementById("letterSpacingBtn");
let savedLetterSpacing = sessionStorage.getItem("letterSpacing");
if (savedLetterSpacing) {
  document.body.style.letterSpacing = savedLetterSpacing;
  letterSpacingSlider.value = parseInt(savedLetterSpacing);

  if (parseInt(savedLetterSpacing) > 0) {
    letterSpacingBtn.classList.add("active");
  }
}
if (letterSpacingSlider) {
  letterSpacingSlider.addEventListener("input", () => {
    const spacing = letterSpacingSlider.value + "px";
    document.body.style.letterSpacing = spacing;
    sessionStorage.setItem("letterSpacing", spacing);

    if (letterSpacingSlider.value > 0) {
      letterSpacingBtn.classList.add("active");
    } else {
      letterSpacingBtn.classList.remove("active");
    }
  });
}
letterSpacingBtn.addEventListener("click", () => {
  const isActive = letterSpacingBtn.classList.toggle("active");

  if (isActive) {
    letterSpacingSlider.value = 2;
    document.body.style.letterSpacing = "2px";
    sessionStorage.setItem("letterSpacing", "2px");
  } else {
    letterSpacingSlider.value = 0;
    document.body.style.letterSpacing = "0px";
    sessionStorage.setItem("letterSpacing", "0px");
  }
});




const fontSelect = document.getElementById("fontFamilySelect");
const savedFont = sessionStorage.getItem("fontFamily");
if (savedFont) {
  document.documentElement.style.fontFamily = savedFont;
  fontSelect.value = savedFont;
}

fontSelect.addEventListener("change", () => {
  const selectedFont = fontSelect.value;
  document.documentElement.style.fontFamily = selectedFont;
  sessionStorage.setItem("fontFamily", selectedFont);
});



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
  if (
    document.activeElement.tagName === "TEXTAREA" ||
    document.activeElement.tagName === "INPUT" ||
    !document.getElementById("finishPopup").classList.contains("hidden")
    ) 
  {
    return;
  }
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