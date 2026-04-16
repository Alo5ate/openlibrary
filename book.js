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
  
  
  let savedReview = null;
  const reviewKey = `review_${bookId}`;
  if (sessionStorage.getItem(reviewKey)) {
      savedReview = JSON.parse(sessionStorage.getItem(reviewKey));
  }
  const cover = book.covers
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : "/images/book-placeholder.png";

  let reviewHTML = "";
  if (inFinished) {
      const saved = savedReview || { rating: "", review: "" };
      reviewHTML = editReviewHtml(savedReview);
    }
  document.getElementById("bookDetails").innerHTML = `
    <img src="${cover}" alt="${book.title}">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.by_statement || "by: N/A"}</div>

    <div class="book-description">
      ${book.description?.value || book.description || "No description available."}
    </div>

  <div class="actions">

    <button id="planBtn" class="detail-btn ${inPlan ? "disabled-btn active-btn" : ""}" 
            ${inPlan ? "disabled" : ""}>
      <img class="btn-icon" src="icons/book-library.svg" alt="">
      <span class="btn-text">Plan to Read</span>
    </button>

    <button id="readingBtn" class="detail-btn ${inReading ? "disabled-btn active-btn" : ""}" 
            ${inReading ? "disabled" : ""}>
      <img class="btn-icon" src="icons/book-open.svg" alt="">
      <span class="btn-text">Reading</span>
    </button>

    <button id="finishedBtn" class="detail-btn ${inFinished ? "disabled-btn active-btn" : ""}" 
            ${inFinished ? "disabled" : ""} onclick="openFinishPopup('${book.key}', '${cover}')">
      <img class="btn-icon" src="icons/flag-chequered.svg" alt="">
      <span class="btn-text">Finished</span>
    </button>

    </div>
    <hr class="review-divider">
     ${reviewHTML} 
    `;
    attachBookButtonHandlers(bookId);
      if(inFinished){
          const readBtn = document.getElementById("readReviewBtn");
    const reviewField = document.getElementById("editReview");

    readBtn.addEventListener("click", () => {
      const text = reviewField.value.trim();
      if (text.length > 0) {
        readReviewText(text);
      } else {
        alert("no review text to read.");
      }
    });
      reviewChanged(savedReview, (rating, review) =>{
        saveReview(bookId, rating, review, book, renderBook);
      });

    }

    if (sessionStorage.getItem("dyslexiaActive") === "true") {
    document.body.classList.add("dyslexia-mode");
  }
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
/*
  finishedBtn.addEventListener("click", () => {
      removeFromAllLists(bookId);

      finished.push(bookId);
      sessionStorage.setItem("finishedBooks", JSON.stringify(finished));

      disableButtons("finished");
  });
  */
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

function removeFromAllLists(bookId) {
  planToRead = planToRead.filter(id => id !== bookId);
  reading = reading.filter(id => id !== bookId);
  finished = finished.filter(id => id !== bookId);
  
  sessionStorage.setItem("planToRead", JSON.stringify(planToRead));
  sessionStorage.setItem("reading", JSON.stringify(reading));
  sessionStorage.setItem("finishedBooks", JSON.stringify(finished));
}



function editReviewHtml(savedReview) {
  const rating = savedReview?.rating || "";
  const review = savedReview?.review || "";
  
  return `
  <div class="finished-review-box">
  <h3>Your Rating & Review</h3>
  <label for="editRating">Rating</label>
  <select id="editRating">
  <option value="">Select rating</option>
  <option value="1" ${rating == 1 ? "selected" : ""}>⭐ 1</option>
  <option value="2" ${rating == 2 ? "selected" : ""}>⭐⭐ 2</option>
  <option value="3" ${rating == 3 ? "selected" : ""}>⭐⭐⭐ 3</option>
  <option value="4" ${rating == 4 ? "selected" : ""}>⭐⭐⭐⭐ 4</option>
  <option value="5" ${rating == 5 ? "selected" : ""}>⭐⭐⭐⭐⭐ 5</option>
  </select>
  <div class="review-textarea-wrapper">
    <textarea id="editReview">${review}</textarea>
    <button id="readReviewBtn" class="read-review-btn" title="Read review aloud">🔊</button>
  </div>
  
  <button id="saveReviewBtn" class="save-review-btn" disabled>Save Changes</button>
  </div>
  `;
}
function reviewChanged(savedReview, saveCallback) {
  const saveBtn = document.getElementById("saveReviewBtn");
  const ratingField = document.getElementById("editRating");
  const reviewField = document.getElementById("editReview");
  
  const originalRating = savedReview?.rating || "";
  const originalReview = savedReview?.review || "";
  
  function checkForChanges() {
    const ratingChanged = ratingField.value !== originalRating;
    const reviewChanged = reviewField.value !== originalReview;
    
    saveBtn.disabled = !(ratingChanged || reviewChanged);
  }
  
  ratingField.addEventListener("change", checkForChanges);
  reviewField.addEventListener("input", checkForChanges);
  
  saveBtn.addEventListener("click", () => {
    saveCallback(ratingField.value, reviewField.value);
  });
}

function saveReview(bookId, rating, review, book, renderFn) {
  const updated = { rating, review };
  sessionStorage.setItem(`review_${bookId}`, JSON.stringify(updated));
  
  alert("Your review has been updated");
  
  renderFn(book);
}
function readReviewText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}