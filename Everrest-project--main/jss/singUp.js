let FirstName = document.getElementById("firstName");
let LastName = document.getElementById("lastName");
let age = document.getElementById("age");
let phone = document.getElementById("phone");
let email = document.getElementById("email");
let password = document.getElementById("password");
let address = document.getElementById("address");
let zipcode = document.getElementById("zipcode");
let avatar = document.getElementById("avatar");

document.querySelector("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  let gender = document.querySelector('input[name="gender"]:checked')?.value;
  console.log(gender);
  fetch("https://api.everrest.educata.dev/auth/sign_up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: FirstName.value,
      lastName: LastName.value,
      age: age.value,
      email: email.value,
      password: password.value,
      address: address.value,
      phone: phone.value,
      zipcode: zipcode.value,
      avatar: avatar.value,
      gender: gender,
    }),
  })
    .then((resp) => resp.json())
    .then((data) => {});
});
