const descricao = document.getElementById("descricao");
const characterCount = document.getElementById("characterCount");

const logoInput = document.getElementById("logoInput");
const restaurantLogo = document.getElementById("restaurantLogo");

const cep = document.getElementById("cep");
const buscarCep = document.getElementById("buscarCep");

const salvarAlteracoes = document.getElementById("salvarAlteracoes");


/* =========================
   CONTADOR DA DESCRIÇÃO
========================= */

function atualizarContador() {
    characterCount.textContent = descricao.value.length;
}

descricao.addEventListener("input", atualizarContador);

atualizarContador();


/* =========================
   ALTERAR LOGO
========================= */

logoInput.addEventListener("change", () => {

    const arquivo = logoInput.files[0];

    if (!arquivo) {
        return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        logoInput.value = "";
        return;
    }

    const tiposPermitidos = [
        "image/jpeg",
        "image/png"
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
        alert("Formato inválido. Utilize JPG ou PNG.");
        logoInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        restaurantLogo.src = event.target.result;
    };

    reader.readAsDataURL(arquivo);
});


/* =========================
   MÁSCARA CEP
========================= */

cep.addEventListener("input", () => {

    let valor = cep.value.replace(/\D/g, "");

    if (valor.length > 5) {
        valor = valor.substring(0, 5) + "-" + valor.substring(5, 8);
    }

    cep.value = valor;
});


/* =========================
   BUSCAR CEP
========================= */

buscarCep.addEventListener("click", async () => {

    const cepValue = cep.value.replace(/\D/g, "");

    if (cepValue.length !== 8) {
        alert("Informe um CEP válido.");
        return;
    }

    try {

        buscarCep.disabled = true;
        buscarCep.innerHTML = "Buscando...";

        const response = await fetch(
            `https://viacep.com.br/ws/${cepValue}/json/`
        );

        if (!response.ok) {
            throw new Error("Erro ao consultar CEP.");
        }

        const endereco = await response.json();

        if (endereco.erro) {
            alert("CEP não encontrado.");
            return;
        }

        document.getElementById("rua").value =
            endereco.logradouro || "";

        document.getElementById("bairro").value =
            endereco.bairro || "";

        document.getElementById("cidade").value =
            endereco.localidade || "";

        document.getElementById("estado").value =
            endereco.uf || "";

    } catch (error) {

        console.error(error);

        alert("Não foi possível buscar o CEP.");

    } finally {

        buscarCep.disabled = false;

        buscarCep.innerHTML = `
            <i data-lucide="search"></i>
            Buscar CEP
        `;

        lucide.createIcons();
    }

});


/* =========================
   SALVAR
========================= */

salvarAlteracoes.addEventListener("click", async () => {
    const endereco = {
        cep: document.getElementById("cep").value,
        rua: document.getElementById("rua").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value
    };

    const dados = {
        nome: document.getElementById("nome").value,
        descricao: document.getElementById("descricao").value,
        endereco
    };

    console.log("Dados da loja:", dados);


    const token = localStorage.getItem("accessToken");
    
    try {

    const response = await fetch(`${API_URL}/v1/dados-estabelecimento/atualizar`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "login.html";
        return;
    }

    if (!response.ok) {
        throw new Error("Erro ao salvar os dados da loja.");
    }

    alert("Alterações salvas com sucesso!");

    } catch (error) {

        console.error("Erro:", error);

        alert("Não foi possível salvar as alterações.");
    }
});