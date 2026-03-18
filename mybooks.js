const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

let planToRead = JSON.parse(sessionStorage.getItem("planToRead")) || [];
let reading = JSON.parse(sessionStorage.getItem("reading")) || [];
let finished = JSON.parse(sessionStorage.getItem("finishedBooks")) || [];
// Load the correct list
if (mode === "reading") {
  loadBooks(reading, "Reading List");
} else if (mode === "plan") {
  loadBooks(planToRead, "Plan to Read");
}else if (mode === "finished") {
  loadBooks(finished, "Finished Books");
}

function loadBooks(list, title) {
  const heading = document.getElementById("listTitle");
  const container = document.getElementById("booksList");

  heading.textContent = title;

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="empty-msg">No books in this list.</p>`;
    return;
  }

  Promise.all(
    list.map(id =>
      fetch(`https://openlibrary.org${id}.json`).then(res => res.json())
    )
  ).then(books => {
    renderBooks(books, mode);
  });
}

function renderBooks(books, mode) {
  const container = document.getElementById("booksList");

  container.innerHTML = books.map(book => {
    const cover = book.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
      : "images/book-placeholder.png";

    const author = book.authors?.[0]?.name || "Unknown";

    let buttons = "";

    if (mode === "reading") {
      buttons = `
        <button class="finished-btn" onclick="markFinished('${book.key}')">
            <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
            <span class="btn-text">Finished</span>
        </button>
      `;
    }

    if (mode === "plan") {
      buttons = `
        <button class="reading-btn" onclick="moveToReading('${book.key}')">
                <img class="btn-icon" src="icons/book-open.svg" alt="">
            <span class="btn-text">Reading</span>
        </button>
        <button class="finished-btn" onclick="markFinished('${book.key}')">
            <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
            <span class="btn-text">Finished</span>
        </button>
      `;
    }

    // mode === "finished" → NO BUTTONS

    return `
      <div class="book-card" data-workkey="${book.key}">
        <img src="${cover}" alt="${book.title}">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${author}</div>
        <div class="book-description">Loading description…</div>
        <div class="book-actions">${buttons}</div>
      </div>
    `;
  }).join("");
  lazyLoadDescriptions();
}


function moveToReading(bookId) {
  bookId = normalizeId(bookId);

  planToRead = planToRead.filter(id => id !== bookId);
  sessionStorage.setItem("planToRead", JSON.stringify(planToRead));

  if (!reading.includes(bookId)) {
    reading.push(bookId);
    sessionStorage.setItem("reading", JSON.stringify(reading));
  }

  window.location.href = "mybooks.html?mode=reading";
}


function markFinished(bookId) {
  bookId = normalizeId(bookId);

  planToRead = planToRead.filter(id => id !== bookId);
  reading = reading.filter(id => id !== bookId);

  sessionStorage.setItem("planToRead", JSON.stringify(planToRead));
  sessionStorage.setItem("reading", JSON.stringify(reading));

  if (!finished.includes(bookId)) {
    finished.push(bookId);
    sessionStorage.setItem("finishedBooks", JSON.stringify(finished));
  }

  window.location.reload();
}

function openBook(id, mode) {
  window.location.href = `book.html?id=${id}&mode=${mode}`;
}





function lazyLoadDescriptions() {
  const cards = document.querySelectorAll(".book-card");

  const observer = new IntersectionObserver(async (entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const card = entry.target;
      const workKey = card.dataset.workkey;
      const descEl = card.querySelector(".book-description");

      if (card.dataset.loaded === "true") {
        obs.unobserve(card);
        continue;
      }

      try {
        const res = await fetch(`https://openlibrary.org${workKey}.json`);
        const data = await res.json();

        let description = "No description available.";

        if (typeof data.description === "string") {
          description = data.description;
        } else if (data.description?.value) {
          description = data.description.value;
        } else if (data.first_sentence?.value) {
          description = data.first_sentence.value;
        }

        descEl.textContent = description;
        card.dataset.loaded = "true";
      } catch (e) {
        descEl.textContent = "No description available.";
      }

      obs.unobserve(card);
    }
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
}

/**/
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("gridSlider");
  const valueDisplay = document.getElementById("gridValue");
  const grid = document.querySelector(".books-grid");

  if (!slider || !grid) return;


  const saved = sessionStorage.getItem("gridColumns") || "5";

  slider.value = saved;
  valueDisplay.textContent = saved;


  document.documentElement.style.setProperty("--grid-columns", saved);

  if (saved === "2" || saved === "1") {
    grid.classList.add("featured-layout");
  } else {
    grid.classList.remove("featured-layout");
  }

  slider.addEventListener("input", () => {
    const val = slider.value;
    valueDisplay.textContent = val;

    document.documentElement.style.setProperty("--grid-columns", val);

    if (val === "2" || val === "1") {
      grid.classList.add("featured-layout");
    } else {
      grid.classList.remove("featured-layout");
    }

    sessionStorage.setItem("gridColumns", val);
  });
});


/**/
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


/**/
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



function normalizeId(id) {
  if (id.startsWith("/works/")) return id;
  return `/works/${id.replace(/[^0-9A-Za-z]/g, "")}`;
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
