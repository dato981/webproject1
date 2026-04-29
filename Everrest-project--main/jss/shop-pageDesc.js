let params = new URLSearchParams(window.location.search);
let id = params.get("id");
let mainImg = document.getElementById("main-image");
let otherImgs = document.getElementById("thumbnails");
let token = localStorage.getItem("token");
let ratecoms = document.querySelector(".rate-comments");

fetch(`https://api.everrest.educata.dev/shop/products/id/${id}`)
  .then((resp) => resp.json())
  .then((p) => {
    displayProduct(p);
    console.log(p);
  });
function displayProduct(p) {
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
    if (parseInt(elText.textContent) < p.stock) {
      elText.textContent = parseInt(elText.textContent) + 1;
    }
  });
  cartControls
    .querySelector(".CartBtn")
    .addEventListener("click", async (e) => {
      e.stopPropagation();
      let quantity = parseInt(cartControls.querySelector(".value").textContent);
      if (quantity === 0) return;
      const resp = await fetch(
        "https://api.everrest.educata.dev/shop/cart/product",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: p._id, quantity }),
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
        const existing = cart.products.find((el) => el.productId === p._id);
        const newQuantity = existing ? existing.quantity + quantity : quantity;

        await fetch("https://api.everrest.educata.dev/shop/cart/product", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: p._id, quantity: newQuantity }),
        });
      }
    });
  document.getElementById("cart-controls").appendChild(cartControls);
  document.getElementById("brand").textContent = p.brand;
  document.getElementById("category").textContent = p.category.name;
  document.getElementById("title").textContent = p.title;
  document.getElementById("description").textContent = p.description;
  document.getElementById("current-price").textContent =
    `${p.price.current} ${p.price.currency}`;
  document.getElementById("before-discount").textContent =
    `${p.price.beforeDiscount} ${p.price.currency}`;
  document.getElementById("discount-badge").textContent =
    `-${p.price.discountPercentage}%`;
  document.getElementById("rating-value").textContent = `${p.rating}`;
  document.getElementById("rating-count").textContent =
    `(${p.ratings.length} reviews)`;
  document.getElementById("stock").textContent =
    p.stock > 0 ? "In Stock" : " Out of Stock";
  document.getElementById("stock").style.color = p.stock > 0 ? "green" : "red";
  document.getElementById("warranty").textContent =
    ` ${p.warranty} year warranty`;
  document.getElementById("main-image").src = p.thumbnail;
  document.getElementById("main-image").alt = p.title;
}
