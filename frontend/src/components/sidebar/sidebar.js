fetch("components/sidebar/sidebar.html")
    .then(response => response.text())
    .then(html => {

        document.getElementById("sidebar").innerHTML = html;

        lucide.createIcons();

        configurarSidebar();

    })
    .catch(error => {
        console.error("Erro ao carregar sidebar:", error);
    });


function configurarSidebar() {

    const paginaAtual = window.location.pathname.split("/").pop();

    const itensMenu = document.querySelectorAll(".menu-item");

    itensMenu.forEach(item => {

        const href = item.getAttribute("href");

        if (href === paginaAtual) {
            item.classList.add("active");
        } else item.classList.remove("active");

    });


    const btnLogout = document.getElementById("btnLogout");

    if (btnLogout) {

        btnLogout.addEventListener("click", (event) => {

            event.preventDefault();

            localStorage.removeItem("accessToken");

            window.location.href = "login.html";

        });

    }

}