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

function loadReadingList() {
    const readingList = JSON.parse(sessionStorage.getItem("reading")) || [];

    const section = document.getElementById("readingListSection");
    const container = document.getElementById("readingListBooks");

    const booksToShow = readingList.slice(0, 5);

    Promise.all(
        booksToShow.map(key =>
            fetch(`https://openlibrary.org${key}.json`).then(res => res.json())
        )
    ).then(books => {
        container.innerHTML = books.map(book => {
            const cover = book.covers?.[0]
                ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
                : "images/book-placeholder.png";

            const title = book.title || "Untitled";

            const author = book.authors?.[0]?.name || "Unknown";

            return `
              <div class="reading-list-item" onclick="openBook('${book.key}')">
                  <img src="${cover}">
                  <div class="book-info">
                      <div class="book-title">${title}</div>
                      <div class="book-author">${author}</div>
                  </div>
              </div>
            `;
        }).join("");
    });
}

document.addEventListener("DOMContentLoaded", loadReadingList);

document.addEventListener("DOMContentLoaded", () => {
    const listContainer = document.getElementById("readingListBooks");
    const emptyMessage = document.getElementById("readingListEmpty");

    const readingList = JSON.parse(sessionStorage.getItem("reading")) || [];

    if (readingList.length === 0) {
        listContainer.style.display = "none";
        emptyMessage.style.display = "block";
    } else {
        listContainer.style.display = "grid";
        emptyMessage.style.display = "none";
    }
});




document.addEventListener("DOMContentLoaded", () => {
  const welcomePrompt = document.getElementById("welcomePrompt");
  const welcomeConfirmBtn = document.getElementById("welcomeConfirmBtn");

  if (!sessionStorage.getItem("welcomeShown")) {
    welcomePrompt.style.display = "flex";
  } else {
    welcomePrompt.style.display = "none";
  }

  welcomeConfirmBtn.addEventListener("click", () => {
    welcomePrompt.style.display = "none";
    sessionStorage.setItem("welcomeShown", "true");
  });
});