let token = localStorage.getItem("token");
let ref_token = localStorage.getItem("refreshtoken");
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
        localStorage.removeItem("refreshToken");
        if (data.access_token) {
          localStorage.setItem("token", access_token);
          localStorage.setItem("ref_token", ref_token);
          window.location.href = "./";
        } else {
          window.location.href = "./signIn.html";
        }
      })
      .catch(() => {
        window.location.href = "./signin.html";
      });
  } else {
    window.location.href = "./signIn.html";
  }
}

const BASE_URL = "https://api.everrest.educata.dev";
let main = document.getElementById("main");
let verified = document.getElementById("verifiedBadge");
let verifiedText = document.getElementById("verifiedText");
let changePassword = document.getElementById("chngPs");
let ChangePasswordDiv = document.getElementById("PassChnDiv");
let logout = document.getElementById("lout");
let hamburger = document.getElementById("hamburger");
let drawer = document.getElementById("nav-drawer");
let prfM = document.getElementById("prf-m");
let logOutM = document.getElementById("lout-m");

fetch(`${BASE_URL}/auth`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((resp) => resp.json())
  .then((data) => {
    fillProfile(data);
    console.log(data);
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
function fillProfile(data) {
  document.getElementById("fullName").textContent =
    `${data.firstName} ${data.lastName}`;
  document.getElementById("email").textContent = data.email;
  document.getElementById("age").textContent = data.age;
  document.getElementById("gender").textContent = data.gender;
  document.getElementById("phone").textContent = data.phone || "not provided";
  document.getElementById("address").textContent =
    data.address || "not provided";
  document.getElementById("zipcode").textContent =
    data.zipcode || "not provided";

  const avatarImg = document.getElementById("avatarImg");
  if (data.avatar) {
    avatarImg.src = data.avatar;
  }
  if (data.verified) {
    verified.classList.remove("no");
    verified.classList.add("yes");
    verifiedText.textContent = "verified";
  } else {
    verified.classList.add("no");
    verified.classList.remove("yes");
    verifiedText.textContent = "unverified";
  }
}
logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./signin.html";
});
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
lout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./signin.html";
});
logOutM.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./signin.html";
});
