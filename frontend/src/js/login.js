// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // impede reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:8085/tasty-auth-service/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password })
      });

      if (!response.ok) throw new Error("Login falhou");
      const data = await response.json();
      console.log(data);
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });
});