const BASE_URL = "https://api.everrest.educata.dev";

let currentPage = 1;
let totalPages = 1;
let currentType = null;
let currentAuthor = "";
let currentKeyword = "";

let fakebtn = document.getElementById("fakebtn");
let quoteEl = document.getElementById("quote");
let authorEl = document.getElementById("author");
let typeEl = document.getElementById("type");
let divQuotes = document.getElementById("quotes-div");
let lists = document.getElementById("lists");
let searchbtn = document.getElementById("searchbtn");
let filterAuthor = document.getElementById("filterAuthor");
let filterKeyword = document.getElementById("filterKeyword");
let pagination = document.getElementById("pagination");
let archiveError = document.getElementById("archiveError");
let prf = document.getElementById("prf");
let logOut = document.getElementById("lout");
let signIn = document.getElementById("sin");
let signUp = document.getElementById("sup");
let token = localStorage.getItem("token");
let hamburger = document.getElementById("hamburger");
let drawer = document.getElementById("nav-drawer");
let prfM = document.getElementById("prf-m");
let logOutM = document.getElementById("lout-m");
let signInM = document.getElementById("sin-m");
let signUpM = document.getElementById("sup-m");

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status}`);
  return resp.json();
}
let gk = fetchJSON(`${BASE_URL}/quote`);
console.log(gk);

function showError(msg) {
  archiveError.textContent = msg;
  archiveError.classList.add("visible");
}

function clearError() {
  archiveError.textContent = "";
  archiveError.classList.remove("visible");
}

function fadeElements(elements, out = true) {
  elements.forEach((el) => el.classList.toggle("quote-fade", out));
}

fakebtn.addEventListener("click", async () => {
  const elements = [quoteEl, authorEl, typeEl];
  fadeElements(elements, true);

  try {
    const data = await fetchJSON(`${BASE_URL}/quote/random`);
    setTimeout(() => {
      quoteEl.textContent = `"${data.quote}"`;
      authorEl.textContent = data.author;
      typeEl.textContent = data.type;
      fadeElements(elements, false);
    }, 400);
  } catch (err) {
    console.error("Random quote failed:", err);
  }
});

function displayQuotes(arr) {
  if (!arr || arr.length === 0) {
    divQuotes.innerHTML = `<div class="quotes-empty">no quotes found in the archive</div>`;
    return;
  }
  divQuotes.innerHTML = arr
    .map(
      (q, i) => `
    <div class="quote-card" style="animation-delay:${i * 0.05}s">
      <div class="quote-card-text">"${q.quote}"</div>
      <div class="quote-card-meta">
        <span class="quote-card-author">${q.author}</span>
        <span class="quote-card-type">${q.type}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function displayPagination() {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  pagination.innerHTML = `
    <button class="page-btn nav" id="prevBtn" ${currentPage === 1 ? "disabled" : ""}>← Prev</button>
    ${pages
      .map((p) =>
        p === "..."
          ? `<span class="page-ellipsis">…</span>`
          : `<button class="page-btn ${p === currentPage ? "active" : ""}" data-page="${p}">${p}</button>`,
      )
      .join("")}
    <button class="page-btn nav" id="nextBtn" ${currentPage === totalPages ? "disabled" : ""}>Next →</button>
  `;

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadQuotes();
    }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadQuotes();
    }
  });
  pagination.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = Number(btn.dataset.page);
      loadQuotes();
    });
  });
}

async function loadQuotes() {
  clearError();
  divQuotes.innerHTML = `<div class="quotes-empty">summoning quotes...</div>`;

  const params = new URLSearchParams();
  params.set("page_index", currentPage);
  params.set("page_size", 10);
  if (currentType) params.set("type", currentType);
  if (currentAuthor) params.set("author", currentAuthor);
  if (currentKeyword) params.set("keywords", currentKeyword);

  try {
    const resp = await fetch(`${BASE_URL}/quote?${params.toString()}`);
    const data = await resp.json();

    if (!resp.ok) {
      showError(
        data.message || data.error || `request failed (${resp.status})`,
      );
      divQuotes.innerHTML = `<div class="quotes-empty">no results found</div>`;
      pagination.innerHTML = "";
      return;
    }

    if (!data.quotes || data.quotes.length === 0) {
      showError("no quotes matched — try different filters");
      divQuotes.innerHTML = `<div class="quotes-empty">nothing found</div>`;
      pagination.innerHTML = "";
      return;
    }

    totalPages = Math.ceil(data.total / 10);
    displayQuotes(data.quotes);
    displayPagination();
  } catch (err) {
    showError("could not reach the archive — check your connection");
    divQuotes.innerHTML = `<div class="quotes-empty">connection lost</div>`;
  }
}

function displayList(arr) {
  const fragment = document.createDocumentFragment();

  const allBtn = document.createElement("button");
  allBtn.className = "type-btn active";
  allBtn.textContent = "all";
  allBtn.dataset.type = "";
  fragment.appendChild(allBtn);

  arr.forEach((e) => {
    const btn = document.createElement("button");
    btn.className = "type-btn";
    btn.textContent = e;
    btn.dataset.type = e;
    fragment.appendChild(btn);
  });

  lists.appendChild(fragment);
}

lists.addEventListener("click", (e) => {
  if (!e.target.classList.contains("type-btn")) return;
  document
    .querySelectorAll(".type-btn")
    .forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  currentType = e.target.dataset.type || null;
  currentPage = 1;
  loadQuotes();
});

searchbtn.addEventListener("click", () => {
  currentAuthor = filterAuthor.value.trim();
  currentKeyword = filterKeyword.value.trim();
  currentPage = 1;
  loadQuotes();
});

[filterAuthor, filterKeyword].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchbtn.click();
  });
});

async function init() {
  try {
    const types = await fetchJSON(`${BASE_URL}/quote/types`);
    displayList(types);
  } catch (err) {
    console.error("Could not load types:", err);
  }

  try {
    await loadQuotes();
  } catch (err) {
    console.error("Could not load quotes:", err);
  }
}

init();

lout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./htmls/signin.html";
});
logOutM.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./htmls/signin.html";
});
function isTokenExpired(token) {
  if (token == null) {
    return true;
  } else {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() > expirationTime;
  }
}
function classAdd(element, clss) {
  return element.classList.add(clss);
}
function classRem(element, clss) {
  return element.classList.remove(clss);
}

let bool = isTokenExpired(token);
if (bool) {
  classAdd(prf, "hide");
  classAdd(logOut, "hide");
  classAdd(logOut.nextElementSibling, "hide");

  classAdd(prfM, "hide");
  classAdd(logOutM, "hide");
} else {
  classRem(prf, "hide");
  classRem(lout, "hide");
  classAdd(prf, "signup");
  classAdd(lout, "signin");
  classAdd(signIn, "hide");
  classAdd(signUp, "hide");
  classAdd(signUp.nextElementSibling, "hide");

  classRem(prfM, "hide");
  classRem(logOutM, "hide");
  classAdd(prfM, "signup");
  classAdd(logOutM, "signin");
  classAdd(signInM, "hide");
  classAdd(signUpM, "hide");
}
hamburger.addEventListener("click", () => {
  const open = drawer.classList.toggle("open");
  hamburger.classList.toggle("active", open);
});

document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !drawer.contains(e.target)) {
    drawer.classList.remove("open");
    hamburger.classList.remove("active");
  }
});
