const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

let planToRead = JSON.parse(sessionStorage.getItem("planToRead")) || [];
let reading = JSON.parse(sessionStorage.getItem("reading")) || [];
let finished = JSON.parse(sessionStorage.getItem("finishedBooks")) || [];

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
          <button class="finished-btn" onclick="event.stopPropagation(); openFinishPopup('${book.key}', '${cover}')">
              <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
              <span class="btn-text">Finished</span>
          </button>
        `;
    }

    if (mode === "plan") {
        buttons = `
          <button class="reading-btn" onclick="event.stopPropagation(); moveToReading('${book.key}')">
              <img class="btn-icon" src="icons/book-open.svg" alt="">
              <span class="btn-text">Reading</span>
          </button>

          <button class="finished-btn" onclick="event.stopPropagation(); openFinishPopup('${book.key}', '${cover}')">
              <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
              <span class="btn-text">Finished</span>
          </button>
        `;
    }

// mode finish not btn

    return `
      <div class="book-card nav-item" data-workkey="${book.key}" onclick="openBook('${book.key}', '${mode}')">
        <img src="${cover}" alt="${book.title}">
        <div class="book-title">${book.title}</div>
        <div class="book-author">${author}</div>
        <div class="book-description">Loading description…</div>
        <div class="book-actions">${buttons}</div>
      </div>
    `;
  }).join("");
  lazyLoadDescriptions();
if (iconsVisible) {
    enableNavigation = true;

    requestAnimationFrame(() => {
        const items = document.querySelectorAll(".nav-item");
        if (items.length > 0) {
            selectedIndex = 0;
            updateSelection();
        }
    });
  }
  if (sessionStorage.getItem("dyslexiaActive") === "true") {
    document.body.classList.add("dyslexia-mode");
  }
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



let currentFinishBookId = null;
function openFinishPopup(bookId, coverUrl) {
  currentFinishBookId = bookId;

  document.getElementById("finishCover").src = coverUrl;
  document.getElementById("finishPopup").classList.remove("hidden");
}
document.getElementById("finishCancel").addEventListener("click", () => {
  document.getElementById("finishPopup").classList.add("hidden");
});
document.getElementById("finishConfirm").addEventListener("click", () => {
  const rating = document.getElementById("finishRating").value;
  const review = document.getElementById("finishReview").value;

  if (!rating) {
    alert("Please select a rating.");
    return;
  }

  const bookId = normalizeId(currentFinishBookId);

  const reviewData = {
    rating,
    review,
    date: new Date().toISOString()
  };
  sessionStorage.setItem(`review_${bookId}`, JSON.stringify(reviewData));

  markFinished(bookId);
  document.getElementById("finishPopup").classList.add("hidden");
});


function normalizeId(id) {
  if (id.startsWith("/works/")) return id;
  return `/works/${id.replace(/[^0-9A-Za-z]/g, "")}`;
}