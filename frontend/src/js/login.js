// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // impede reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
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

const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordToggle.setAttribute("aria-label", "Esconder senha");

        passwordToggle.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

                <path
                    d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

                <path
                    d="M9.88 5.08C10.56 4.87 11.27 4.75 12 4.75C18.5 4.75 22 12 22 12C22 12 20.77 14.46 18.55 16.37"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <path
                    d="M6.61 6.61C3.7 8.55 2 12 2 12C2 12 5.5 19.25 12 19.25C13.47 19.25 14.81 18.83 16 18.2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        `;
    } else {
        passwordInput.type = "password";
        passwordToggle.setAttribute("aria-label", "Mostrar senha");

        passwordToggle.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    stroke-width="1.8"
                />
            </svg>
        `;
    }
});