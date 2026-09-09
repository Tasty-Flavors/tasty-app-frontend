const token = localStorage.getItem("accessToken");
const btnEditar = document.getElementById("btnEditarRestaurante");
const formEditar = document.getElementById("formEditarRestaurante");
const btnSalvar = document.getElementById("btnSalvarRestaurante");
const btnCancelar = document.getElementById("btnCancelarEdicao");
const novaDescricao = document.getElementById("novaDescricao");
const novaLogo = document.getElementById("novaLogo");
const novoEndereco = document.getElementById("novoEndereco");

const restaurantInfo = document.getElementById("restaurantInfo");
const restaurantAdress = document.getElementById("restaurant_adress");
const restaurantDescription = document.getElementById("restaurant_description");

if (!token) {
  window.location.href = "login.html";
}

btnEditar.addEventListener("click", () => {

  // Preenche os campos com os valores atuais
  novoEndereco.value = restaurantAdress.textContent;
  novaDescricao.value = restaurantDescription.textContent;

  // Esconde as informações atuais
  restaurantInfo.style.display = "none";

  // Mostra o formulário
  formEditar.style.display = "block";

});


btnCancelar.addEventListener("click", () => {

  formEditar.style.display = "none";

  restaurantInfo.style.display = "block";

});


function alterarTempo() {
  let novoTempo = prompt("Novo tempo de entrega (minutos):");
  if (novoTempo) {
    document.getElementById("deliveryTime").innerText = novoTempo + " minutos";
  }
}

function atualizarDashboard() {
  document.getElementById("aceitos").innerText = Math.floor(Math.random() * 20);
  document.getElementById("recusados").innerText = Math.floor(
    Math.random() * 5,
  );
  document.getElementById("concluidos").innerText = Math.floor(
    Math.random() * 15,
  );

  let valor = (Math.random() * 500).toFixed(2);
  document.getElementById("faturamento").innerText = "R$ " + valor;
}
async function carregarFotoPerfilRestaurante() {
  try {
    const response = await fetch(`${API_URL}/v1/restaurante/dashboard`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 401) {
      localStorage.removeItem("accessToken");

      window.location.href = "login.html";

      return;
    }
    if (!response.ok) {
      throw new Error("Erro ao buscar restaurante");
    }

    const restaurante = await response.json();
    document.getElementById("restaurant_img").src = restaurante.imagem || "https://assets.monica.im/low-code/img/20241205053930263.webp";
    document.querySelectorAll("[data-restaurant-name]").forEach(elemento => {elemento.textContent = restaurante.nomeEstabelecimento});
    document.getElementById("restaurant_adress").textContent = restaurante.endereco || "Sem endereço";
    document.getElementById("restaurant_description").textContent = restaurante.descricao || "Sem descrição";
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

function logout() {
  localStorage.removeItem("accessToken");

  window.location.href = "login.html";
}


btnSalvar.addEventListener("click", async () => {
  try {
    const formData = new FormData();

    formData.append("descricao", novaDescricao.value);

    if (novaLogo.files.length > 0) {
      formData.append("logo", novaLogo.files[0]);
    }

    const response = await fetch(
      "http://localhost:8081/tasty-app-bff/v1/restaurante",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error("Erro ao atualizar restaurante");
    }

    const restaurante = await response.json();

    document.getElementById("restaurant_description").textContent =
      restaurante.descricao;

    document.getElementById("restaurant_img").src =
      restaurante.imagem || "https://assets.monica.im/low-code/img/20241205053930263.webp";

    formEditar.style.display = "none";

  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao atualizar restaurante");
  }
});

window.addEventListener("DOMContentLoaded", carregarFotoPerfilRestaurante);
setInterval(atualizarDashboard, 5000);
