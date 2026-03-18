document.querySelectorAll('.category').forEach(cat => {
  cat.addEventListener('click', () => {
    const category = cat.dataset.category;
    window.location.href = `category.html?cat=${category}`;
  });
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value;
  fetch(`https://openlibrary.org/search.json?q=${query}`)
    .then(res => res.json())
    .then(data => displayResults(data.docs));
});

function displayResults(books) {
  const container = document.getElementById('results');
  container.innerHTML = books.map(book => `
    <div class="book">
      <h3>${book.title}</h3>
      <p>${book.author_name?.join(', ') || 'Unknown author'}</p>
    </div>
  `).join('');
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
function toggleTools() {
  const extra = document.getElementById("settingsFooter");
  extra.classList.toggle("show");
}
function openFinishedList() {
  window.location.href = "mybooks.html?mode=finished";
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



