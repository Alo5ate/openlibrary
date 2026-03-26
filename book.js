const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let planToRead = JSON.parse(sessionStorage.getItem("planToRead")) || [];
let reading = JSON.parse(sessionStorage.getItem("reading")) || [];
let finished = JSON.parse(sessionStorage.getItem("finishedBooks")) || [];


console.log("BOOK ID:", id);
fetch(`https://openlibrary.org${id}.json`)
  .then(res => res.json())
  .then(data => renderBook(data));
  function renderBook(book) {
  const bookId = normalizeId(book.key || id);
    
  const inPlan = planToRead.includes(bookId);
  const inReading = reading.includes(bookId);
  const inFinished = finished.includes(bookId);

  const cover = book.covers
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : "/images/book-placeholder.png";

  document.getElementById("bookDetails").innerHTML = `
    <img src="${cover}" alt="${book.title}">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.by_statement || ""}</div>

    <div class="book-description">
      ${book.description?.value || book.description || "No description available."}
    </div>

    <div class="actions">
      <button id="planBtn" class="${inPlan ? "disabled-btn active-btn" : ""}" 
              ${inPlan ? "disabled" : ""}>
        Plan to Read
      </button>

      <button id="readingBtn" class="${inReading ? "disabled-btn active-btn" : ""}" 
              ${inReading ? "disabled" : ""}>
        Reading
      </button>

      <button id="finishedBtn" class="${inFinished ? "disabled-btn active-btn" : ""}" 
              ${inFinished ? "disabled" : ""}>
        Finished
      </button>
    </div>
  `;

  attachBookButtonHandlers(bookId);
}

function attachBookButtonHandlers(bookId) {
  const planBtn = document.getElementById("planBtn");
  const readingBtn = document.getElementById("readingBtn");
  const finishedBtn = document.getElementById("finishedBtn");

  planBtn.addEventListener("click", () => {
      removeFromAllLists(bookId);

      planToRead.push(bookId);
      sessionStorage.setItem("planToRead", JSON.stringify(planToRead));

      disableButtons("plan");
  });

  readingBtn.addEventListener("click", () => {
      removeFromAllLists(bookId);

      reading.push(bookId);
      sessionStorage.setItem("reading", JSON.stringify(reading));

      disableButtons("reading");
  });

  finishedBtn.addEventListener("click", () => {
      removeFromAllLists(bookId);

      finished.push(bookId);
      sessionStorage.setItem("finishedBooks", JSON.stringify(finished));

      disableButtons("finished");
  });
}

function normalizeId(id) {
  if (id.startsWith("/works/")) return id;
  return `/works/${id.replace(/[^0-9A-Za-z]/g, "")}`;
}

function disableButtons(active) {
  const planBtn = document.getElementById("planBtn");
  const readingBtn = document.getElementById("readingBtn");
  const finishedBtn = document.getElementById("finishedBtn");

  planBtn.disabled = active === "plan";
  readingBtn.disabled = active === "reading";
  finishedBtn.disabled = active === "finished";

  planBtn.classList.toggle("active-btn", active === "plan");
  readingBtn.classList.toggle("active-btn", active === "reading");
  finishedBtn.classList.toggle("active-btn", active === "finished");

  planBtn.classList.toggle("disabled-btn", active === "plan");
  readingBtn.classList.toggle("disabled-btn", active === "reading");
  finishedBtn.classList.toggle("disabled-btn", active === "finished");
}

function removeFromAllLists(bookId) {
    planToRead = planToRead.filter(id => id !== bookId);
    reading = reading.filter(id => id !== bookId);
    finished = finished.filter(id => id !== bookId);

    sessionStorage.setItem("planToRead", JSON.stringify(planToRead));
    sessionStorage.setItem("reading", JSON.stringify(reading));
    sessionStorage.setItem("finishedBooks", JSON.stringify(finished));
}