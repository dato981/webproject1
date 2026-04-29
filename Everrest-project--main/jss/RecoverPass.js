let Rpass = document.getElementById("email");

Rpass.addEventListener("change", () => {
  let value = Rpass.value;
  console.log(value);

  fetch("https://api.everrest.educata.dev/auth/recovery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: `${value}`,
    }),
  })
    .then((resp) => {
      if (!resp.ok) {
        return resp.msg;
      }
      resp.json()
    })
    .then((data) => {
      window.location.href = "../index.html"
    });
});
