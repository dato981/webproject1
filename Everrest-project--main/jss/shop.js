let token = localStorage.getItem("token");
let main = document.getElementById("main");
let div1 = document.getElementById("div1");
let div2 = document.getElementById("div2");
let search = document.getElementById("search-input");
let currentpage = 1;
let keyword = "";
let searchTimer;
let categorys = document.getElementById("category-filters");
let brands = document.getElementById("brand-filters");
let sortButtons = document.getElementById("sort-buttons");
let ascDesc = "";
let asc = document.getElementById("sort-asc");
let desc = document.getElementById("sort-desc");
let clear = document.getElementById("clear");
let currentCategory = -1;
let fitlerGroup = document.querySelectorAll(".filter-group h3");
let cart = document.getElementById("cart");
fetch(
  "https://api.everrest.educata.dev/shop/products/all?page_size=12&page_index=1",
)
  .then((resp) => resp.json())
  .then((data) => {
    console.log(data);
    let totalpages = Math.ceil(data.total / 10);
    display(data.products);
    displayButtons(data.total);
    activeNonactive(1);
  });

sortButtons.addEventListener("click", (e) => {
  if (e.target.id == "sort-asc") {
    ascDesc = "asc";
  } else if (e.target.id == "sort-desc") {
    ascDesc = "desc";
  }
  fetch(
    `https://api.everrest.educata.dev/shop/products/search?sort_by=price&sort_direction=${ascDesc}&page_size=12`,
  )
    .then((resp) => resp.json())
    .then((data) => {
      display(data.products);
    });
});

fetch("https://api.everrest.educata.dev/shop/products/brands")
  .then((resp) => resp.json())
  .then((data) => {
    console.log(data);
    data.forEach((el) => {
      let btn = document.createElement("button");
      btn.classList.add("filter-btn");
      btn.textContent = el;
      btn.addEventListener("click", () => {
        fetch(`https://api.everrest.educata.dev/shop/products/brand/${el}`)
          .then((resp) => resp.json())
          .then((data) => {
            display(data.products);
          });
      });
      brands.appendChild(btn);
    });
  });

fetch("https://api.everrest.educata.dev/shop/products/categories")
  .then((resp) => resp.json())
  .then((data) => {
    data.forEach((el) => {
      let btn = document.createElement("button");
      btn.classList.add("filter-btn");
      btn.textContent = el.name;
      btn.addEventListener("click", () => {
        currentCategory = el.id;
        fetch(
          `https://api.everrest.educata.dev/shop/products/category/${el.id}?page_size=12`,
        )
          .then((resp) => resp.json())
          .then((data) => {
            console.log(data);
            display(data.products);
            displayButtons(data.total, "category");
          });
      });
      categorys.appendChild(btn);
    });
  });

function fetchForcategory(index) {
  div2.innerHTML = "";
  fetch(
    `https://api.everrest.educata.dev/shop/products/category/${currentCategory}?page_size=12&page_index=${index}`,
  )
    .then((resp) => resp.json())
    .then((data) => {
      display(data.products);
      displayButtons(data.total, "category");
      console.log(data);
    });
}

clear.addEventListener("click", () => {
  search.value = "";
  fetch(
    "https://api.everrest.educata.dev/shop/products/all?page_size=12&page_index=1",
  )
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      let totalpages = Math.ceil(data.total / 10);
      display(data.products);
      displayButtons(data.total);
      activeNonactive(1);
    });
});

search.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  div2.innerHTML = "";

  searchTimer = setTimeout(() => {
    keyword = e.target.value.trim();
    if (keyword.length === 0) {
      fetchpage(1);
      return;
    }
    fetch(
      `https://api.everrest.educata.dev/shop/products/search?keywords=${keyword}&page_size=12&page_index=1`,
    )
      .then((resp) => resp.json())
      .then((data) => {
        display(data.products);
        displayButtons(data.total);
      });
  }, 500);
});

function display(arr) {
  div1.innerHTML = "";
  let price = 0;
  arr.forEach((el) => {
    if (el.price.currency == "GEL") {
      price = el.price.current / 2.7;
    } else {
      price = el.price.current;
    }
    let div = document.createElement("div");
    let cartControls = document.createElement("div");
    cartControls.classList.add("Cart-veli");
    cartControls.innerHTML = `
  <button class="minus btn">−</button>
  <p class="value">0</p>
  <button class="plus btn">+</button>
  <button class="CartBtn">Add to Cart</button>
`;
    cartControls.querySelector(".minus").addEventListener("click", (e) => {
      e.stopPropagation();
      let elText = cartControls.querySelector(".value");
      let current = parseInt(elText.textContent);
      if (current > 0) elText.textContent = current - 1;
    });
    cartControls.querySelector(".plus").addEventListener("click", (e) => {
      e.stopPropagation();
      let elText = cartControls.querySelector(".value");
      if (parseInt(elText.textContent) < el.stock) {
        elText.textContent = parseInt(elText.textContent) + 1;
      }
    });
    cartControls
      .querySelector(".CartBtn")
      .addEventListener("click", async (e) => {
        e.stopPropagation();
        let quantity = parseInt(
          cartControls.querySelector(".value").textContent,
        );
        if (quantity === 0) return;
        const resp = await fetch(
          "https://api.everrest.educata.dev/shop/cart/product",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: el._id, quantity }),
          },
        );
        if (!resp.ok) {
          const cartResp = await fetch(
            "https://api.everrest.educata.dev/shop/cart",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const cart = await cartResp.json();
          const existing = cart.products.find((p) => p.productId === el._id);
          const newQuantity = existing
            ? existing.quantity + quantity
            : quantity;

          await fetch("https://api.everrest.educata.dev/shop/cart/product", {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: el._id, quantity: newQuantity }),
          });
        }
      });
    div.innerHTML = `<div class="">
  <div class="product-image">
    <img src="${el.thumbnail}" alt="${el.title}" referrerpolicy="no-referrer">
  </div>
  <div class="product-info">
    <p class="product-brand">${el.brand}</p>
    <h3 class="product-name">${el.title}</h3>
    <div class="product-rating">Rating:${el.rating.toFixed(1)}</div>
    <div class="product-bottom">
      <div class="product-price">${Math.round(price)} USD</div>
      <div class="product-stock ${el.stock > 0 ? "in" : "out"}">${el.stock > 0 ? "In Stock" : "Out of Stock"}</div>
    </div>
  </div>
</div>`;
    div.addEventListener("click", () => {
      window.location.href = `./shop-description.html?id=${el._id}`;
    });
    div.classList.add("product-card");
    div.appendChild(cartControls);
    div1.appendChild(div);
  });
}

function displayButtons(total, mode = "all") {
  div2.innerHTML = "";
  let totalpages = Math.ceil(total / 10);
  for (let i = 1; i < totalpages + 1; i++) {
    let btn = document.createElement("button");
    btn.textContent = i;
    btn.dataset.page = i;
    btn.classList.add("page-btn");
    btn.addEventListener("click", () => {
      currentpage = i;
      if (mode === "category") {
        fetchForcategory(i);
      } else {
        fetchpage(i);
      }
    });
    div2.appendChild(btn);
  }
}

function fetchpage(index) {
  let url = `https://api.everrest.educata.dev/shop/products/all?page_size=12&page_index=${index}`;
  if (keyword.length > 0) {
    url = `https://api.everrest.educata.dev/shop/products/search?keywords=${keyword}&page_size=12&page_index=${index}`;
  }
  fetch(url)
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      display(data.products);
      activeNonactive(currentpage);
    });
}

function activeNonactive(index) {
  let btns = document.querySelectorAll("#div2 button");
  btns.forEach((el) => {
    el.classList.remove("active");
    if (Number(el.dataset.page) == currentpage) {
      el.classList.add("active");
    }
  });
}

fitlerGroup.forEach((el) => {
  el.addEventListener("click", () => {
    el.nextElementSibling.classList.toggle("hide");
  });
});
const hamburger = document.getElementById("hamburger");
const navDrawer = document.getElementById("nav-drawer");
const navOverlay = document.getElementById("nav-overlay");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const filterBtn = document.getElementById("filter-toggle-btn");

function openNav() {
  navDrawer.classList.add("open");
  navOverlay.classList.add("visible");
  hamburger.classList.add("active");
}
function closeNav() {
  navDrawer.classList.remove("open");
  navOverlay.classList.remove("visible");
  hamburger.classList.remove("active");
}
function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("visible");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
}

hamburger.addEventListener("click", () => {
  navDrawer.classList.contains("open") ? closeNav() : openNav();
});
navOverlay.addEventListener("click", closeNav);
filterBtn.addEventListener("click", openSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

function checkMobile() {
  const isMobile = window.innerWidth <= 640;
  filterBtn.style.display = isMobile ? "flex" : "none";
}
checkMobile();
window.addEventListener("resize", checkMobile);
