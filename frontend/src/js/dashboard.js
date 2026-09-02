const token = localStorage.getItem("accessToken");

if (!token) {
  window.location.href = "login.html";
}

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
    const response = await fetch("http://localhost:8080/restaurante", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("token");

      window.location.href = "login.html";

      return;
    }
    if (!response.ok) {
      throw new Error("Erro ao buscar restaurante");
    }

    const restaurante = await response.json();

    document.getElementById("restaurant_img").src = restaurante.foto;
    document.getElementById("restaurant_name").textContent = restaurante.nome;
    document.getElementById("restaurant_adress").textContent = restaurante.endereco;
    document.getElementById("restaurant_description").textContent = restaurante.descricao;
  } catch (erro) {
    console.error("Erro:", erro);
  }
}

function logout() {
  localStorage.removeItem("token");

  window.location.href = "login.html";
}


window.addEventListener("DOMContentLoaded", carregarFotoPerfilRestaurante);
setInterval(atualizarDashboard, 5000);
