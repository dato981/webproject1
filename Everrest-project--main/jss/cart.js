let token = localStorage.getItem("token");
let ref_token = localStorage.getItem("refreshtoken");
let clearCart = document.getElementById("clear");
let chekout = document.getElementById("chek");

function isTokenExpired(token) {
  if (token == null) {
    return true;
  } else {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() > expirationTime;
  }
}
if (isTokenExpired(token)) {
  if (ref_token) {
    fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: ref_token }),
    })
      .then((resp) => resp.json())
      .then((data) => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshtoken");
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refreshtoken", data.refresh_token);
          window.location.href = "./";
        } else {
          window.location.href = "./signIn.html";
        }
      })
      .catch(() => {
        window.location.href = "./signIn.html";
      });
  } else {
    window.location.href = "./signIn.html";
  }
}
let bool = isTokenExpired(token);

clearCart.addEventListener("click", async (e) => {
  if (
    document.getElementById("div1").innerHTML == "<p>Your cart is empty</p>"
  ) {
    e.stopPropagation();
  } else {
    fetch("https://api.everrest.educata.dev/shop/cart", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.success == true) {
          window.location.reload();
        }
      });
  }
});
chekout.addEventListener("click", async (e) => {
      fetch("https://api.everrest.educata.dev/shop/cart/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((resp) => resp.json()).then(data => {
      document.getElementById("div1").innerHTML = "<p> Your Purchase is successful, thank you!</p>";
    })
})
if (bool) {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshtoken");
  window.location.href = "./signIn.html";
} else {
  fetch("https://api.everrest.educata.dev/shop/cart", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
      display(data.products, data.total.quantity);
    })
    .catch((err) => {
      document.getElementById("div1").innerHTML = "<p>Your cart is empty</p>";
      document.getElementById("div1").style.display = "flex";
      document.getElementById("div1").style.justifyContent = "center";
      document.getElementById("div1").style.padding = "30px";
    });
  async function display(arr, quantity) {
    for (const el of arr) {
      let container = document.getElementById("div1");
      container.innerHTML = "";
      const resp = await fetch(
        `https://api.everrest.educata.dev/shop/products/id/${el.productId}`,
      );
      const p = await resp.json();
      let price =
        p.price.currency === "GEL"
          ? (p.price.current / 2.7).toFixed(1)
          : p.price.current;
      const card = document.createElement("div");
      card.classList.add("cart-item");
      let cartControls = document.createElement("div");
      cartControls.classList.add("Cart-veli");
      cartControls.innerHTML = `
  <p class="value">Quantity: ${el.quantity}</p>
  <button class="CartBtn">Remove item</button>
`;
      cartControls
        .querySelector(".CartBtn")
        .addEventListener("click", async (e) => {
          e.stopPropagation();
          fetch("https://api.everrest.educata.dev/shop/cart", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: el.productId }),
          })
            .then((resp) => resp.json())
            .then((data) => {
              container.innerHTML = "<p>Your cart is empty</p>";
            });
        });
      card.innerHTML = `
   <div class="">
  <div class="product-image">
    <img src="${p.thumbnail}" alt="${p.title}" referrerpolicy="no-referrer">
  </div>
  <div class="product-info">
    <p class="product-brand">${p.brand}</p>
    <h3 class="product-name">${p.title}</h3>
    <div class="product-rating">Rating:${p.rating.toFixed(1)}</div>
    <div class="product-bottom">
      <div class="product-price">${price} USD</div>
      <div class="product-stock ${p.stock > 0 ? "in" : "out"}">${p.stock > 0 ? "In Stock" : "Out of Stock"}</div>
    </div>
  </div>
</div>`;
      card.appendChild(cartControls);
      container.appendChild(card);
    }
  }
}
