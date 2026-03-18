const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch(`https://openlibrary.org${id}.json`)
  .then(res => res.json())
  .then(data => renderBook(data));

function renderBook(book) {
  const cover = book.covers
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : "/images/book-placeholder.png";

  document.getElementById("bookDetails").innerHTML = `
    <img src="${cover}" alt="${book.title}" onerror="this.onerror=null; this.src='images/book-placeholder.png'">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.by_statement || ""}</div>

    <div class="book-description">
      ${book.description?.value || book.description || "No description available."}
    </div>

    <div class="actions">
      <button>Plan to Read</button>
      <button>Reading</button>
    </div>
  `;
}



function goHome() {
  window.location.href = "index.html";
}

function openReadingList() {
  window.location.href = "mybooks.html?mode=reading";
}

function openPlanList() {
  window.location.href = "mybooks.html?mode=plan";
}
function openFinishedList() {
  window.location.href = "mybooks.html?mode=finished";
}
function toggleTools() {
  const extra = document.getElementById("settingsFooter");
  extra.classList.toggle("show");
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


/**/
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
