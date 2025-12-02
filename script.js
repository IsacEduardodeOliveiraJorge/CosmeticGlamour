// =============================================
//  CONTAS
// =============================================
const adminLogin = {
    user: "admin1234",
    senha: "123456789",
    avatar: "img/perfil.png"
};

let contas = JSON.parse(localStorage.getItem("contas")) || [
    { user: "Isac Eduardo de Oliveira Jorge", senha: "griferl07", avatar: "" }
];

function salvarContas() {
    localStorage.setItem("contas", JSON.stringify(contas));
}

// =============================================
//  PRODUTOS INICIAIS
// =============================================
const initialProducts = [
    {nome:'Batom Matte Rosa', preco:29.90, img:'img/batonrosa.webp'},
    {nome:'Batom Vermelho Clássico', preco:32.90, img:'img/batonvermelho.jpg'},
    {nome:'Gloss Labial Holográfico', preco:22.50, img:'img/GlossHolografico.jpg'},
    {nome:'Gloss Transparente', preco:18.00, img:'https://i.imgur.com/qIVIYk0.jpeg'},
    {nome:'Base Líquida Alta Cobertura', preco:49.90, img:'https://i.imgur.com/7Es7uYK.jpeg'}
];

if (!localStorage.getItem("produtos")) {
    localStorage.setItem("produtos", JSON.stringify(initialProducts));
}

// =============================================
//  CARRINHO
// =============================================
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
function salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function addToCart(i) {
    const produtos = JSON.parse(localStorage.getItem("produtos"));
    carrinho.push(produtos[i]);
    salvarCarrinho();
    renderCart();
}

function delItem(i) {
    carrinho.splice(i, 1);
    salvarCarrinho();
    renderCart();
}

function renderCart() {
    const ul = document.getElementById("listaCarrinho");
    const totalEl = document.getElementById("cartTotal");

    ul.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, i) => {
        total += item.preco;
        ul.innerHTML += `
            <li>
                ${item.nome} - R$ ${item.preco.toFixed(2)}
                <button onclick="delItem(${i})">X</button>
            </li>
        `;
    });
    totalEl.textContent = total.toFixed(2);
}
renderCart();

function finalizarCompra() {
    const user = JSON.parse(localStorage.getItem("logado"));
    if (!user) {
        alert("Faça login para finalizar a compra.");
        showTab("conta");
        return;
    }

    if (carrinho.length === 0) return alert("Carrinho vazio.");

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    pedidos.push({
        usuario: user.user,
        itens: carrinho,
        data: new Date().toLocaleString()
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    alert("Compra realizada com sucesso!");
    carrinho = [];
    salvarCarrinho();
    renderCart();
}

// =============================================
//  TABS
// =============================================
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
}

// =============================================
//  LOGIN
// =============================================
document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const user = loginUser.value;
    const pass = loginPass.value;

    // ADMIN
    if (user === adminLogin.user && pass === adminLogin.senha) {
        localStorage.setItem("logado", JSON.stringify({
            user:"ADM",
            avatar:adminLogin.avatar,
            tipo:"admin"
        }));
        atualizarPerfil();
        showTab("admin");
        renderProducts();
        renderAdminList();
        return;
    }

    // CLIENTE
    const pessoa = contas.find(c => c.user === user && c.senha === pass);
    if (!pessoa) return alert("Usuário ou senha incorretos!");

    localStorage.setItem("logado", JSON.stringify({
        user: pessoa.user,
        avatar: pessoa.avatar || "img/perfil.png",
        tipo: "cliente"
    }));

    atualizarPerfil();
    showTab("produtos");
});

// =============================================
//  CADASTRO
// =============================================
registerForm.addEventListener("submit", function(e){
    e.preventDefault();

    let avatar = "";
    const file = cadAvatar.files[0];
    if (file) avatar = URL.createObjectURL(file);

    contas.push({
        user: cadUser.value,
        senha: cadPass.value,
        avatar
    });

    salvarContas();
    alert("Conta criada! Faça login.");
});

// =============================================
//  RECUPERAÇÃO DE SENHA
// =============================================
function openRecovery() {
    const nome = prompt("Digite seu usuário:");
    if (!nome) return;

    const conta = contas.find(c => c.user === nome);
    if (!conta) return alert("Usuário não encontrado.");

    alert("Sua senha é: " + conta.senha);
}

// =============================================
//  PERFIL DO CLIENTE
// =============================================
document.getElementById("openProfileBtn")?.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("logado"));
    if (!user) return;
    document.getElementById("perfilFoto").src = user.avatar;
    document.getElementById("perfilNome").textContent = user.user;

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const lista = document.getElementById("pedidoLista");
    lista.innerHTML = "";

    pedidos
        .filter(p => p.usuario === user.user)
        .forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${p.data}</strong><br>${p.itens.map(i => i.nome).join(", ")}`;
            lista.appendChild(li);
        });

    showTab("perfil");
});

// =============================================
//  PERFIL VISUAL
// =============================================
function atualizarPerfil() {
    const user = JSON.parse(localStorage.getItem("logado"));

    if (!user) {
        profileAvatar.src = "img/perfil.png";
        profileAvatarSmall.src = "img/perfil.png";
        profileName.textContent = "Convidado";
        profileRole.textContent = "Não logado";
        logoutBtn.style.display = "none";
        adminMenuBtn.style.display = "none";
        openLoginBtn.style.display = "block";
        openRegisterBtn.style.display = "block";
        return;
    }

    profileAvatar.src = user.avatar;
    profileAvatarSmall.src = user.avatar;

    if (user.tipo === "admin") {
        profileName.textContent = "ADM";
        profileRole.textContent = "Administrador";
        adminMenuBtn.style.display = "inline-block";
    } else {
        profileName.textContent = "Cliente";
        profileRole.textContent = user.user;
        adminMenuBtn.style.display = "none";
    }

    logoutBtn.style.display = "block";
    openLoginBtn.style.display = "none";
    openRegisterBtn.style.display = "none";
}
atualizarPerfil();

logoutBtn.onclick = () => {
    localStorage.removeItem("logado");
    location.reload();
};

// =============================================
//  ADMIN CRUD
// =============================================
let editingIndex = null;

// Renderização do catálogo principal (clientes/convidados)
function renderProducts(list = null) {
    const produtos = list || JSON.parse(localStorage.getItem("produtos"));
    const container = document.getElementById("listaProdutos");

    container.innerHTML = "";
    produtos.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "produto";

        const user = JSON.parse(localStorage.getItem("logado"));
        let adminButtons = "";

        // Apenas ADM vê os botões de editar/excluir
        if (user && user.tipo === "admin") {
            adminButtons = `
                <button onclick="openProductModal('edit', ${index})">Editar</button>
                <button onclick="confirmDelete(${index})" style="background:#c33;">Excluir</button>
            `;
        }

        div.innerHTML = `
            <img src="${p.img}">
            <h3>${p.nome}</h3>
            <p>R$ ${p.preco.toFixed(2)}</p>
            <button onclick="addToCart(${index})">Adicionar</button>
            ${adminButtons}
        `;
        container.appendChild(div);
    });
}

// Renderização do admin
function renderAdminList() {
    const produtos = JSON.parse(localStorage.getItem("produtos"));
    const list = document.getElementById("adminList");
    list.innerHTML = "";

    produtos.forEach((p, index) => {
        const div = document.createElement("div");
        div.className = "produto";

        div.innerHTML = `
            <img src="${p.img}">
            <h3>${p.nome}</h3>
            <p>R$ ${p.preco.toFixed(2)}</p>
            <button onclick="openProductModal('edit', ${index})">Editar</button>
            <button onclick="confirmDelete(${index})" style="background:#c33;">Excluir</button>
        `;
        list.appendChild(div);
    });
}

// MODAL PRODUTO
function openProductModal(mode, index = null) {
    productModal.style.display = "flex";
    const produtos = JSON.parse(localStorage.getItem("produtos"));

    if (mode === "edit") {
        editingIndex = index;
        modalTitle.textContent = "Editar Produto";
        prodNome.value = produtos[index].nome;
        prodPreco.value = produtos[index].preco;
        prodImg.value = produtos[index].img;
    } else {
        editingIndex = null;
        modalTitle.textContent = "Novo Produto";
        prodNome.value = "";
        prodPreco.value = "";
        prodImg.value = "";
    }
}

function closeProductModal() {
    productModal.style.display = "none";
}

// SALVAR PRODUTO
productForm.addEventListener("submit", e => {
    e.preventDefault();

    const nome = prodNome.value;
    const preco = parseFloat(prodPreco.value);
    let img = prodImg.value;

    const file = prodImgFile.files[0];
    if (file) img = URL.createObjectURL(file);

    const produtos = JSON.parse(localStorage.getItem("produtos"));

    if (editingIndex !== null) {
        produtos[editingIndex] = { nome, preco, img };
    } else {
        produtos.push({ nome, preco, img });
    }

    localStorage.setItem("produtos", JSON.stringify(produtos));
    renderProducts();
    renderAdminList();
    closeProductModal();
});

// EXCLUSÃO
function confirmDelete(i) {
    confirmModal.style.display = "flex";
    confirmYes.onclick = () => {
        const produtos = JSON.parse(localStorage.getItem("produtos"));
        produtos.splice(i, 1);
        localStorage.setItem("produtos", JSON.stringify(produtos));
        renderProducts();
        renderAdminList();
        closeConfirm();
    };
}
function closeConfirm() {
    confirmModal.style.display = "none";
}

// Inicializa
renderProducts();
renderAdminList();
