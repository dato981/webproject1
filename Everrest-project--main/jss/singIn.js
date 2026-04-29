let email = document.getElementById("email");
let password = document.getElementById("password");
let form = document.getElementById("form");
let msg = document.getElementById("errorMsg");

form.addEventListener("submit", (el) => {
  el.preventDefault();
  msg.innerHTML = "";
  fetch("https://api.everrest.educata.dev/auth/sign_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        return resp.json().then((err) => Promise.reject(err));
      }
    })
    .then((data) => {
      console.log(data);
      console.log(data.access_token);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      window.location.href = "../index.html";
    })
    .catch((err) => {
      console.error("Login failed:", err);
    });
});
