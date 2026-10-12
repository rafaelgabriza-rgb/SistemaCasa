// Simulador de iluminação da casa
(function () {
  "use strict";

  const CHAVE = "casa-iluminacao-v1";
  const BASE = [29, 32, 36]; // cor do cômodo "no escuro"

  const COMODOS = [
    { id: "sala", nome: "Salas" },
    { id: "cozinha", nome: "Cozinhas" },
    { id: "quarto", nome: "Quartos" },
    { id: "banheiro", nome: "Banheiros" },
    { id: "garagem", nome: "Garagens" },
    { id: "quintal", nome: "Quintais" },
  ];

  const CORES = [
    ["Branco quente", "#ffc98a"],
    ["Branco neutro", "#fff1d6"],
    ["Branco frio", "#dcecff"],
    ["Vermelho", "#ff4d4d"],
    ["Laranja", "#ff9a3c"],
    ["Amarelo", "#ffe14d"],
    ["Verde", "#4be08a"],
    ["Ciano", "#3fd6e6"],
    ["Azul", "#4d7cff"],
    ["Roxo", "#9b6bff"],
    ["Rosa", "#ff6bb5"],
  ];

  const CENAS = [
    {
      nome: "Cinema",
      desc: "Salas em azul, bem baixinhas.",
      luzes: { sala: { cor: "#4d7cff", brilho: 20 } },
    },
    {
      nome: "Jantar",
      desc: "Salas e cozinhas em luz quente.",
      luzes: {
        sala: { cor: "#ffc98a", brilho: 60 },
        cozinha: { cor: "#ffc98a", brilho: 85 },
      },
    },
    {
      nome: "Relax",
      desc: "Salas e quartos em tons suaves.",
      luzes: {
        sala: { cor: "#ff9a3c", brilho: 35 },
        quarto: { cor: "#ff6bb5", brilho: 30 },
      },
    },
    {
      nome: "Festa",
      desc: "Cores fortes na casa toda.",
      luzes: {
        sala: { cor: "#9b6bff", brilho: 100 },
        cozinha: { cor: "#3fd6e6", brilho: 90 },
        quarto: { cor: "#ff6bb5", brilho: 90 },
        banheiro: { cor: "#ffe14d", brilho: 80 },
        garagem: { cor: "#4be08a", brilho: 80 },
        quintal: { cor: "#4d7cff", brilho: 100 },
      },
    },
    {
      nome: "Boa noite",
      desc: "Tudo apagado, só os quartos ficam fraquinhos.",
      luzes: { quarto: { cor: "#ffc98a", brilho: 8 } },
    },
  ];

  const ICONE_POWER =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/></svg>';

  // ---------- Estado ----------
  function estadoInicial() {
    const e = {};
    COMODOS.forEach((c) => {
      e[c.id] = { on: c.id === "sala", cor: "#ffc98a", brilho: 80 };
    });
    return e;
  }

  function carregar() {
    const padrao = estadoInicial();
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (!salvo) return padrao;
      COMODOS.forEach((c) => {
        const s = salvo[c.id];
        if (
          s &&
          typeof s.on === "boolean" &&
          /^#[0-9a-f]{6}$/i.test(s.cor) &&
          Number.isFinite(s.brilho)
        ) {
          padrao[c.id] = {
            on: s.on,
            cor: s.cor,
            brilho: Math.min(100, Math.max(5, s.brilho)),
          };
        }
      });
    } catch (e) {
      /* sem armazenamento: segue com o padrão */
    }
    return padrao;
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      /* ignora */
    }
  }

  let estado = carregar();
  let selecionado = "sala";

  // ---------- Cores ----------
  function hexParaRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function misturar(a, b, t) {
    return a.map((v, i) => Math.round(b[i] + (v - b[i]) * t));
  }

  function luminancia([r, g, b]) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

  // ---------- Elementos ----------
  const grade = document.getElementById("planta-grade");
  const resumo = document.getElementById("resumo");
  const nomeEl = document.getElementById("controle-nome");
  const estadoEl = document.getElementById("controle-estado");
  const pontoEl = document.getElementById("controle-ponto");
  const interruptor = document.getElementById("interruptor");
  const brilhoEl = document.getElementById("brilho");
  const brilhoValor = document.getElementById("brilho-valor");
  const coresEl = document.getElementById("cores");
  const corCustom = document.getElementById("cor-custom");
  const cenasEl = document.getElementById("cenas");

  // ---------- Construção da tela ----------
  const comodoEls = {};

  COMODOS.forEach((c) => {
    const wrap = document.createElement("div");
    wrap.className = "comodo";
    wrap.style.gridArea = c.id;

    const sel = document.createElement("button");
    sel.type = "button";
    sel.className = "comodo-sel";
    sel.innerHTML =
      '<span class="comodo-nome"></span><span class="comodo-estado"></span>';
    sel.addEventListener("click", () => {
      selecionado = c.id;
      render();
    });

    const power = document.createElement("button");
    power.type = "button";
    power.className = "comodo-power";
    power.innerHTML = ICONE_POWER;
    power.addEventListener("click", () => {
      estado[c.id].on = !estado[c.id].on;
      selecionado = c.id;
      salvar();
      render();
    });

    wrap.append(sel, power);
    grade.appendChild(wrap);
    comodoEls[c.id] = { wrap, sel, power };
  });

  CORES.forEach(([nome, hex]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cor";
    b.style.setProperty("--c", hex);
    b.setAttribute("aria-label", nome);
    b.title = nome;
    b.dataset.cor = hex;
    b.addEventListener("click", () => definirCor(hex));
    coresEl.appendChild(b);
  });

  CENAS.forEach((cena) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cena";
    const pontos = Object.values(cena.luzes)
      .map((l) => `<i style="--c:${l.cor}"></i>`)
      .join("");
    b.innerHTML = `<strong>${cena.nome}</strong><span class="desc">${cena.desc}</span><span class="cena-pontos" aria-hidden="true">${pontos}</span>`;
    b.addEventListener("click", () => aplicarCena(cena));
    cenasEl.appendChild(b);
  });

  // ---------- Ações ----------
  function definirCor(hex) {
    const e = estado[selecionado];
    e.cor = hex.toLowerCase();
    e.on = true;
    salvar();
    render();
  }

  function aplicarCena(cena) {
    COMODOS.forEach((c) => {
      const l = cena.luzes[c.id];
      if (l) {
        estado[c.id] = { on: true, cor: l.cor, brilho: l.brilho };
      } else {
        estado[c.id].on = false;
      }
    });
    salvar();
    render();
  }

  function todos(ligar) {
    COMODOS.forEach((c) => (estado[c.id].on = ligar));
    salvar();
    render();
  }

  interruptor.addEventListener("click", () => {
    estado[selecionado].on = !estado[selecionado].on;
    salvar();
    render();
  });

  brilhoEl.addEventListener("input", () => {
    const e = estado[selecionado];
    e.brilho = Number(brilhoEl.value);
    e.on = true;
    salvar();
    render();
  });

  corCustom.addEventListener("input", () => definirCor(corCustom.value));

  document.getElementById("acender-tudo").addEventListener("click", () => todos(true));
  document.getElementById("apagar-tudo").addEventListener("click", () => todos(false));

  document.getElementById("aplicar-todos").addEventListener("click", () => {
    const { cor } = estado[selecionado];
    COMODOS.forEach((c) => {
      estado[c.id].cor = cor;
      estado[c.id].on = true;
    });
    salvar();
    render();
  });

  // ---------- Desenho ----------
  function render() {
    let acesas = 0;

    COMODOS.forEach((c) => {
      const e = estado[c.id];
      const { wrap, sel, power } = comodoEls[c.id];
      if (e.on) acesas++;

      wrap.dataset.ligada = String(e.on);
      wrap.classList.toggle("selecionado", c.id === selecionado);

      if (e.on) {
        const forca = 0.22 + 0.78 * (e.brilho / 100);
        const cor = hexParaRgb(e.cor);
        const base = misturar(cor, BASE, forca);
        const centro = misturar([255, 255, 255], base, 0.22);
        wrap.style.setProperty("--luz", rgb(base));
        wrap.style.setProperty("--luz-centro", rgb(misturar(centro, base, 0.9)));
        wrap.style.setProperty(
          "--brilho-sombra",
          `rgba(${cor[0]}, ${cor[1]}, ${cor[2]}, ${(0.5 * forca).toFixed(2)})`
        );
        wrap.dataset.claro = String(luminancia(base) > 0.52);
      }

      sel.querySelector(".comodo-nome").textContent = c.nome;
      sel.querySelector(".comodo-estado").textContent = e.on
        ? `Acesa, ${e.brilho}%`
        : "Apagada";
      sel.setAttribute(
        "aria-label",
        `${c.nome}, ${e.on ? "acesa, brilho " + e.brilho + "%" : "apagada"}. Selecionar`
      );
      sel.setAttribute("aria-pressed", String(c.id === selecionado));

      power.setAttribute("aria-label", `${e.on ? "Apagar" : "Acender"} luz: ${c.nome}`);
      power.setAttribute("aria-pressed", String(e.on));
    });

    resumo.textContent =
      acesas === 0
        ? "Todas as luzes estão apagadas."
        : acesas === 1
        ? `1 de ${COMODOS.length} luzes acesas.`
        : `${acesas} de ${COMODOS.length} luzes acesas.`;

    // Painel de controle
    const atual = COMODOS.find((c) => c.id === selecionado);
    const e = estado[selecionado];

    nomeEl.textContent = atual.nome;
    estadoEl.textContent = e.on ? `Acesa com ${e.brilho}% de brilho` : "Apagada";
    interruptor.setAttribute("aria-checked", String(e.on));
    interruptor.setAttribute("aria-label", `Luz: ${atual.nome}`);

    pontoEl.classList.toggle("ligada", e.on);
    pontoEl.style.background = e.on ? e.cor : "";
    pontoEl.style.setProperty("--ponto-brilho", e.cor);

    brilhoEl.value = e.brilho;
    brilhoValor.textContent = `${e.brilho}%`;
    corCustom.value = e.cor;

    coresEl.querySelectorAll(".cor").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.cor === e.cor));
    });
  }

  render();
})();
