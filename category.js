let planToRead = JSON.parse(sessionStorage.getItem("planToRead")) || [];
let reading = JSON.parse(sessionStorage.getItem("reading")) || [];
let finished = JSON.parse(sessionStorage.getItem("finishedBooks")) || [];


document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value;
  if (query.trim() !== "") {
    window.location.href = `search.html?q=${query}`;
  }
});


const params = new URLSearchParams(window.location.search);
const category = params.get("cat");


document.getElementById("categoryTitle").textContent =
  category.replace("_", " ").toUpperCase();


fetch(`https://openlibrary.org/subjects/${category}.json?limit=40`)
  .then(res => res.json())
  .then(data => renderBooks(data.works));

function renderBooks(books) {
  const grid = document.getElementById("booksGrid");

  grid.innerHTML = books.map(book => {
    const cover = book.cover_id
      ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
      : "/images/book-placeholder.png";

    const author = book.authors?.[0]?.name || "Unknown";

    const id = book.key;
    const inPlan = planToRead.includes(id);
    const inReading = reading.includes(id);
    const inFinished = finished.includes(id);

    let buttons = "";

    if (inFinished) {
      buttons = `
        <button class="finished-btn disabled-btn" disabled>
          <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
          <span class="btn-text">Finished</span>
        </button>
      `;
    } else {
      buttons = `
        <button class="nav-action plan-btn ${inPlan ? "disabled-btn active-btn" : ""}"
                data-id="${id}"
                onclick="addToPlan('${id}', this)"
                ${inPlan ? "disabled" : ""}>
          <img class="btn-icon" src="icons/book-library.svg" alt="">
          <span class="btn-text">Plan to Read</span>
        </button>

        <button class="nav-action reading-btn ${inReading ? "disabled-btn active-btn" : ""}"
                data-id="${id}"
                onclick="addToReading('${id}', this)"
                ${inReading ? "disabled" : ""}>
          <img class="btn-icon" src="icons/book-open.svg" alt="">
          <span class="btn-text">Reading</span>
        </button>
      `;
    }

    return `
      <div class="book-card nav-item" data-workkey="${book.key}"
      onclick="if (!event.target.closest('.nav-action')) openBook('${book.key}')">
      
        <img src="${cover}" alt="${book.title}" onclick="openBook('${book.key}')" onerror="this.onerror=null; this.src='images/book-placeholder.png'">
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
}

function openBook(key) {
  window.location.href = `book.html?id=${key}`;
}

function addToPlan(bookId, btn) {
  bookId = normalizeId(bookId);

  reading = reading.filter(id => id !== bookId);
  sessionStorage.setItem("reading", JSON.stringify(reading));

  if (!planToRead.includes(bookId)) {
    planToRead.push(bookId);
    sessionStorage.setItem("planToRead", JSON.stringify(planToRead));
  }

  updateButtons(bookId);
}

function addToReading(bookId, btn) {
  bookId = normalizeId(bookId);

  planToRead = planToRead.filter(id => id !== bookId);
  sessionStorage.setItem("planToRead", JSON.stringify(planToRead));

  if (!reading.includes(bookId)) {
    reading.push(bookId);
    sessionStorage.setItem("reading", JSON.stringify(reading));
  }

  updateButtons(bookId);
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

function updateButtons(bookId) {
  const planBtns = document.querySelectorAll(`button.plan-btn[data-id="${bookId}"]`);
  const readingBtns = document.querySelectorAll(`button.reading-btn[data-id="${bookId}"]`);

  const isPlanned = planToRead.includes(bookId);
  const isReading = reading.includes(bookId);

  planBtns.forEach(btn => {
    btn.classList.remove("disabled-btn", "active-btn");
    btn.disabled = false;
    if (isPlanned) {
      btn.classList.add("disabled-btn", "active-btn");
      btn.disabled = true;
    }
  });

  readingBtns.forEach(btn => {
    btn.classList.remove("disabled-btn", "active-btn");
    btn.disabled = false;
    if (isReading) {
      btn.classList.add("disabled-btn", "active-btn");
      btn.disabled = true;
    }
  });
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




function normalizeId(id) {
  if (id.startsWith("/works/")) return id;
  return `/works/${id.replace(/[^0-9A-Za-z]/g, "")}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const mobileBtn = document.getElementById("mobileLayoutBtn");
  const grid = document.querySelector(".books-grid");

  if (!mobileBtn || !grid) return;

  mobileBtn.addEventListener("click", () => {
    grid.classList.toggle("featured-layout");
    grid.classList.toggle("mobile-featured");
  });
});