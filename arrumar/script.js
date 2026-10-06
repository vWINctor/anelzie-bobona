/* ===== Utilitários e sessão (localStorage) ===== */
const pagina = document.body.dataset.page;
const $ = (id) => document.getElementById(id);

const Sessao = {
  usuarios: () => JSON.parse(localStorage.getItem("usuarios") || "[]"),
  salvarUsuarios: (lista) => localStorage.setItem("usuarios", JSON.stringify(lista)),
  atual: () => JSON.parse(localStorage.getItem("usuarioAtual") || "null"),
  entrar: (usuario) => localStorage.setItem("usuarioAtual", JSON.stringify(usuario)),
  sair: () => localStorage.removeItem("usuarioAtual"),
};

/* ===== Mensagem central "teste concluído" ===== */
function mostrarAviso(texto) {
  document.querySelector(".toast")?.remove();
  const aviso = document.createElement("div");
  aviso.className = "toast";
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 1800);
}

/* ===== Footer: data atual ===== */
function iniciarFooter() {
  $("dataAtual").textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/* ===== Menu e submenus (clique abre/fecha) ===== */
function iniciarMenu() {
  // Seleciona os elementos do HTML
  const btnSobre = document.getElementById('btn-sobre');
  const menuVerticalSobre = document.getElementById('menu-vertical-sobre');
  const btnContato = document.getElementById('btn-contato');
  const menuVerticalContato = document.getElementById('menu-vertical-contato');

  // Adiciona o evento de clique nos botões "Sobre" e "Contato"
  btnSobre.addEventListener('click', function (event) {
    abreMenu(event, menuVerticalSobre);
  });

  btnContato.addEventListener('click', function (event) {
    abreMenu(event, menuVerticalContato);
  });

  // Função geral para abrir/fechar TODOS OS menus verticais
  function abreMenu(event, menu) {
    event.preventDefault(); // Evita que a página recarregue ao clicar no link
    // Liga/Desliga a classe 'active' do menu vertical
    menu.classList.toggle('active');
  }

  function fechaMenu(event, menu, btn) {
    if (!menu.contains(event.target) && event.target !== btn) {
      menu.classList.remove('active');
    }
  }

  // Fecha o menu se o usuário clicar fora dele
  document.addEventListener('click', function (event) {
    fechaMenu(event, menuVerticalSobre, btnSobre);
    fechaMenu(event, menuVerticalContato, btnContato);
  });

  // Ao clicar em Empresa, Clientes, Telefones ou Email, a página rola até a
  // seção de informações (link #id) e o submenu fecha
  document.querySelectorAll(".submenu a").forEach((link) => {
    link.addEventListener("click", () => {
      menuVerticalSobre.classList.remove('active');
      menuVerticalContato.classList.remove('active');
    });
  });

  // Itens dos submenus e botões de teste:
  // sem login -> login.html; com login -> "teste concluído"
  document.querySelectorAll("[data-protected]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (Sessao.atual()) mostrarAviso("teste concluído");
      else window.location.href = "login.html";
    });
  });
}

/* ===== Cabeçalho conforme o login ===== */
function iniciarCabecalho() {
  const usuario = Sessao.atual();
  if (pagina === "diario") {
    $("userName").textContent = usuario.nome;
    // No site logado, "Login" vira "Sair" e "Início" permanece no diário
    $("linkInicio").href = "final.html";
    const sair = $("itemLogin").querySelector("a");
    sair.textContent = "Sair";
    sair.href = "index.html";
    sair.addEventListener("click", () => Sessao.sair());
  }
}

/* ===== Formulários ===== */
function campoVazio(...ids) {
  return ids.some((id) => !$(id).value.trim());
}

function iniciarLogin() {
  $("formLogin").addEventListener("submit", (e) => {
    e.preventDefault();
    if (campoVazio("email", "senha")) {
      $("mensagem").textContent = "preencha todos os campos";
      return;
    }
    const email = $("email").value.trim().toLowerCase();
    const cadastrado = Sessao.usuarios().find((u) => u.email === email);
    Sessao.entrar({ nome: cadastrado ? cadastrado.nome : email.split("@")[0], email });
    window.location.href = "final.html";
  });
}

function iniciarCadastro() {
  $("formCadastro").addEventListener("submit", (e) => {
    e.preventDefault();
    if (campoVazio("nome", "email", "senha")) {
      $("mensagem").textContent = "preencha todos os campos";
      return;
    }
    const usuario = {
      nome: $("nome").value.trim(),
      email: $("email").value.trim().toLowerCase(),
      senha: $("senha").value,
    };
    const lista = Sessao.usuarios().filter((u) => u.email !== usuario.email);
    lista.push(usuario);
    Sessao.salvarUsuarios(lista);
    Sessao.entrar({ nome: usuario.nome, email: usuario.email });
    window.location.href = "final.html";
  });
}

/* ===== Diário ===== */
function iniciarDiario() {
  const chave = "notas_" + Sessao.atual().email;
  let humor = "";

  const lerNotas = () => JSON.parse(localStorage.getItem(chave) || "[]");

  function desenharNotas() {
    const lista = $("listaNotas");
    lista.innerHTML = "";
    const notas = lerNotas();
    if (!notas.length) {
      lista.innerHTML = "<li>Nenhuma nota ainda. Escreva a primeira acima.</li>";
      return;
    }
    notas.slice().reverse().forEach((n) => {
      const li = document.createElement("li");
      const data = document.createElement("small");
      data.textContent = `${n.humor} ${n.data}`;
      const texto = document.createElement("p");
      texto.textContent = n.texto;
      li.append(data, texto);
      lista.appendChild(li);
    });
  }

  $("moods").addEventListener("click", (e) => {
    const botao = e.target.closest(".mood");
    if (!botao) return;
    humor = botao.dataset.mood;
    document.querySelectorAll(".mood").forEach((b) => b.classList.toggle("ativo", b === botao));
  });

  $("btnSalvar").addEventListener("click", () => {
    const texto = $("nota").value.trim();
    if (!humor || !texto) {
      $("mensagem").textContent = "escolha um humor e escreva sua nota";
      return;
    }
    const notas = lerNotas();
    notas.push({ humor, texto, data: new Date().toLocaleString("pt-BR") });
    localStorage.setItem(chave, JSON.stringify(notas));
    $("nota").value = "";
    $("mensagem").textContent = "";
    mostrarAviso("Nota salva!");
    desenharNotas();
  });

  desenharNotas();
}

/* ===== Tema (site branco) ===== */
function aplicarTema() {
  document.body.classList.toggle("tema-claro", localStorage.getItem("tema") === "claro");
}

/* ===== Notas do usuário logado (usadas no calendário e nas estatísticas) ===== */
function notasDoUsuario() {
  return JSON.parse(localStorage.getItem("notas_" + Sessao.atual().email) || "[]");
}

/* ===== Janela central ===== */
function abrirModal(html) {
  $("modalConteudo").innerHTML = html;
  $("modal").hidden = false;
}
function fecharModal() {
  $("modal").hidden = true;
}

/* ===== Configurações ===== */
function abrirConfiguracoes() {
  const claro = localStorage.getItem("tema") === "claro";
  abrirModal(`
    <h2>Configurações</h2>
    <label>Cor do site</label>
    <button type="button" class="btn" id="btnTema">${claro ? "Voltar para o site escuro" : "Mudar site para branco"}</button>
    <label for="selIdioma">Idioma</label>
    <select id="selIdioma">
      <option>Português</option>
      <option>English</option>
      <option>Español</option>
    </select>`);

  $("btnTema").addEventListener("click", () => {
    localStorage.setItem("tema", document.body.classList.contains("tema-claro") ? "escuro" : "claro");
    aplicarTema();
    abrirConfiguracoes(); // redesenha com o texto do botão atualizado
  });
  // O seletor de idioma é apenas visual (não precisa funcionar)
}

/* ===== Calendário ===== */
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
               "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
let calAno, calMes;

function abrirCalendario() {
  const hoje = new Date();
  calAno = hoje.getFullYear();
  calMes = hoje.getMonth();
  desenharCalendario();
}

function desenharCalendario() {
  // Humor registrado em cada dia do mês exibido
  const humorDoDia = {};
  notasDoUsuario().forEach((n) => {
    const m = n.data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m && Number(m[2]) - 1 === calMes && Number(m[3]) === calAno) humorDoDia[Number(m[1])] = n.humor;
  });

  const hoje = new Date();
  const primeiroDia = new Date(calAno, calMes, 1).getDay();
  const totalDias = new Date(calAno, calMes + 1, 0).getDate();

  let linhas = "<tr>" + "<td></td>".repeat(primeiroDia);
  for (let d = 1; d <= totalDias; d++) {
    const ehHoje = d === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear();
    const emoji = humorDoDia[d] ? `<small>${humorDoDia[d]}</small>` : "";
    linhas += `<td class="${ehHoje ? "hoje" : ""}">${d}${emoji}</td>`;
    if ((primeiroDia + d) % 7 === 0 && d < totalDias) linhas += "</tr><tr>";
  }
  linhas += "</tr>";

  abrirModal(`
    <h2>Calendário</h2>
    <p class="cal-ano">${calAno}</p>
    <p class="cal-mes">${MESES[calMes]}</p>
    <div class="cal-nav">
      <button type="button" class="btn" data-nav="-1">‹ Anterior</button>
      <button type="button" class="btn" data-nav="1">Próximo ›</button>
    </div>
    <table class="cal">
      <thead><tr>${DIAS_SEMANA.map((s) => `<th>${s}</th>`).join("")}</tr></thead>
      <tbody>${linhas}</tbody>
    </table>`);
}

/* ===== Estatísticas ===== */
const PESO_HUMOR = { "😄": 5, "🙂": 4, "😐": 3, "😔": 2, "😡": 1 };

function abrirEstatisticas() {
  const notas = notasDoUsuario();
  if (!notas.length) {
    abrirModal("<h2>Estatísticas</h2><p>Nenhuma nota ainda. Salve uma nota com humor para ver a média.</p>");
    return;
  }
  const contagem = {};
  Object.keys(PESO_HUMOR).forEach((e) => (contagem[e] = 0));
  let soma = 0;
  notas.forEach((n) => { contagem[n.humor]++; soma += PESO_HUMOR[n.humor]; });

  const media = soma / notas.length;
  const emojiMedio = Object.keys(PESO_HUMOR).reduce((a, b) =>
    Math.abs(PESO_HUMOR[a] - media) < Math.abs(PESO_HUMOR[b] - media) ? a : b);

  const barras = Object.keys(contagem).map((e) => `
    <div class="barra-linha">
      <span>${e}</span>
      <div class="barra"><span style="width:${(contagem[e] / notas.length) * 100}%"></span></div>
      <span>${contagem[e]}</span>
    </div>`).join("");

  abrirModal(`
    <h2>Estatísticas</h2>
    <p class="media">Humor médio: <strong>${media.toFixed(1)} / 5</strong> ${emojiMedio}</p>
    <p class="media">Dias registrados: <strong>${notas.length}</strong></p>
    ${barras}`);
}

function iniciarPaineis() {
  $("btnConfig").addEventListener("click", abrirConfiguracoes);
  $("btnCalendario").addEventListener("click", abrirCalendario);
  $("btnEstatisticas").addEventListener("click", abrirEstatisticas);

  $("modalFechar").addEventListener("click", fecharModal);
  $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });

  // Navegação entre meses do calendário
  $("modalConteudo").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-nav]");
    if (!botao) return;
    calMes += Number(botao.dataset.nav);
    if (calMes < 0) { calMes = 11; calAno--; }
    if (calMes > 11) { calMes = 0; calAno++; }
    desenharCalendario();
  });
}

/* ===== Página inicial: se a imagem não existir, mostra o espaço tracejado ===== */
function iniciarImagens() {
  document.querySelectorAll(".img-slot img").forEach((img) => {
    const remover = () => img.remove();
    img.addEventListener("error", remover);
    if (img.complete && img.naturalWidth === 0) remover();
  });
}

/* ===== Inicialização por página ===== */
if (pagina === "diario" && !Sessao.atual()) {
  window.location.href = "login.html"; // área protegida
} else {
  aplicarTema();
  iniciarFooter();
  iniciarMenu();
  iniciarCabecalho();
  if (pagina === "home") iniciarImagens();
  if (pagina === "login") iniciarLogin();
  if (pagina === "cadastro") iniciarCadastro();
  if (pagina === "diario") { iniciarDiario(); iniciarPaineis(); }
}