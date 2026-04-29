let form = document.getElementById("form");
let token = localStorage.getItem("token");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let oldpass = document.getElementById("OldPass").value;
  let newpass = document.getElementById("NewPass").value;
  fetch("https://api.everrest.educata.dev/auth/change_password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldPassword: oldpass,
      newPassword: newpass,
    }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refreshtoken", data.refresh_token);
      window.location.href = "../index.html"
    });
});
