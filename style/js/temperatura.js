// Simulador de temperatura da casa
(function () {
  "use strict";

  const CHAVE = "casa-temperatura-v1";
  const EXTERNA = 29;   // temperatura "lá fora" (simulada)
  const MIN = 16;
  const MAX = 30;
  const VENTO = { baixa: 0.6, media: 1, alta: 1.5 };

  const COMODOS = [
    { id: "sala", nome: "Sala" },
    { id: "cozinha", nome: "Cozinha" },
    { id: "quarto", nome: "Quarto" },
    { id: "escritorio", nome: "Escritório" },
  ];

  const NOME_MODO = { frio: "Resfriar", calor: "Aquecer", vento: "Ventilar" };

  // ---------- Estado ----------
  function padrao() {
    const salas = {};
    COMODOS.forEach((c, i) => {
      salas[c.id] = { on: c.id === "sala", temp: 27 + i * 0.4 };
    });
    return { ligado: true, alvo: 23, modo: "frio", vento: "media", salas };
  }

  function carregar() {
    const e = padrao();
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (!s) return e;
      if (typeof s.ligado === "boolean") e.ligado = s.ligado;
      if (Number.isFinite(s.alvo)) e.alvo = Math.min(MAX, Math.max(MIN, s.alvo));
      if (NOME_MODO[s.modo]) e.modo = s.modo;
      if (VENTO[s.vento]) e.vento = s.vento;
      COMODOS.forEach((c) => {
        const r = s.salas && s.salas[c.id];
        if (r && typeof r.on === "boolean" && Number.isFinite(r.temp)) {
          e.salas[c.id] = { on: r.on, temp: r.temp };
        }
      });
    } catch (err) { /* segue com o padrão */ }
    return e;
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (err) { /* ignora */ }
  }

  const estado = carregar();

  // ---------- Elementos ----------
  const $ = (id) => document.getElementById(id);
  const termostato = $("termostato");
  const arco = $("arco");
  const resumo = $("resumo");
  const alvoEl = $("dial-valor");
  const agoraEl = $("dial-agora");
  const legendaEl = $("dial-legenda");
  const power = $("power");
  const lista = $("comodos");

  const fmt = (n) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Arco do dial: 270 graus
  const RAIO = 88;
  const CIRC = 2 * Math.PI * RAIO;
  const ARCO = CIRC * 0.75;
  $("trilho").setAttribute("stroke-dasharray", `${ARCO} ${CIRC}`);

  // ---------- Lista de cômodos ----------
  const itens = {};
  COMODOS.forEach((c) => {
    const li = document.createElement("div");
    li.className = "comodo";
    li.innerHTML =
      '<div><div class="comodo-nome"></div><div class="comodo-estado"></div></div>' +
      '<div class="comodo-lado"><span class="comodo-temp"></span>' +
      '<button type="button" class="interruptor" role="switch" aria-checked="false"></button></div>' +
      '<div class="comodo-barra" aria-hidden="true"><span></span></div>';
    li.querySelector(".comodo-nome").textContent = c.nome;
    const sw = li.querySelector(".interruptor");
    sw.setAttribute("aria-label", `Ar-condicionado: ${c.nome}`);
    sw.addEventListener("click", () => {
      estado.salas[c.id].on = !estado.salas[c.id].on;
      salvar();
      render();
    });
    lista.appendChild(li);
    itens[c.id] = li;
  });

  // ---------- Ações ----------
  function mudarAlvo(delta) {
    estado.alvo = Math.min(MAX, Math.max(MIN, estado.alvo + delta));
    if (!estado.ligado) estado.ligado = true;
    salvar();
    render();
  }

  $("menos").addEventListener("click", () => mudarAlvo(-1));
  $("mais").addEventListener("click", () => mudarAlvo(1));

  power.addEventListener("click", () => {
    estado.ligado = !estado.ligado;
    salvar();
    render();
  });

  document.querySelectorAll("[data-modo]").forEach((b) =>
    b.addEventListener("click", () => {
      estado.modo = b.dataset.modo;
      estado.ligado = true;
      salvar();
      render();
    })
  );

  document.querySelectorAll("[data-vento]").forEach((b) =>
    b.addEventListener("click", () => {
      estado.vento = b.dataset.vento;
      salvar();
      render();
    })
  );

  // ---------- Simulação ----------
  function tick() {
    const taxa = 0.15 * VENTO[estado.vento];

    COMODOS.forEach((c) => {
      const s = estado.salas[c.id];
      const ativo = estado.ligado && s.on;

      if (ativo && estado.modo === "frio") {
        if (s.temp > estado.alvo) s.temp = Math.max(estado.alvo, s.temp - taxa);
      } else if (ativo && estado.modo === "calor") {
        if (s.temp < estado.alvo) s.temp = Math.min(estado.alvo, s.temp + taxa);
      } else if (ativo && estado.modo === "vento") {
        const meta = EXTERNA - 1.5;
        s.temp += Math.sign(meta - s.temp) * Math.min(0.04, Math.abs(meta - s.temp));
      } else {
        // sem ar: a temperatura vai voltando para a de fora
        s.temp += Math.sign(EXTERNA - s.temp) * Math.min(0.04, Math.abs(EXTERNA - s.temp));
      }
    });

    salvar();
    render();
  }

  setInterval(tick, 1500);

  // ---------- Desenho ----------
  function corDaTemperatura(t) {
    if (t <= 21) return "#5ab4ff";
    if (t <= 25) return "#4be0b0";
    if (t <= 28) return "#ffc94d";
    return "#ff7a4c";
  }

  function textoEstado(s) {
    if (!estado.ligado || !s.on) return "Ar desligado";
    if (estado.modo === "vento") return "Ventilando";
    if (estado.modo === "frio") return s.temp > estado.alvo + 0.05 ? "Resfriando" : "Na temperatura";
    return s.temp < estado.alvo - 0.05 ? "Aquecendo" : "Na temperatura";
  }

  function render() {
    // Dial
    termostato.dataset.modo = estado.modo;
    termostato.dataset.ligado = String(estado.ligado);

    const frac = (estado.alvo - MIN) / (MAX - MIN);
    arco.setAttribute("stroke-dasharray", `${Math.max(0.001, ARCO * frac)} ${CIRC}`);

    alvoEl.firstChild.textContent = estado.alvo.toFixed(0);
    legendaEl.textContent = estado.ligado
      ? `${NOME_MODO[estado.modo]}, ventilador ${estado.vento === "media" ? "médio" : estado.vento}`
      : "Sistema desligado";

    const ligadas = COMODOS.filter((c) => estado.salas[c.id].on);
    const media =
      COMODOS.reduce((soma, c) => soma + estado.salas[c.id].temp, 0) / COMODOS.length;
    agoraEl.textContent = `Casa agora: ${fmt(media)}°C`;

    power.setAttribute("aria-checked", String(estado.ligado));

    document.querySelectorAll("[data-modo]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.modo === estado.modo))
    );
    document.querySelectorAll("[data-vento]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.vento === estado.vento))
    );

    resumo.textContent = !estado.ligado
      ? `Ar desligado. A casa está em ${fmt(media)}°C.`
      : ligadas.length === 0
      ? `Sistema ligado, mas nenhum cômodo com ar. A casa está em ${fmt(media)}°C.`
      : `Casa em ${fmt(media)}°C, com ar em ${ligadas.length} de ${COMODOS.length} cômodos.`;

    // Cômodos
    COMODOS.forEach((c) => {
      const s = estado.salas[c.id];
      const el = itens[c.id];
      el.querySelector(".comodo-temp").textContent = `${fmt(s.temp)}°C`;
      el.querySelector(".comodo-estado").textContent = textoEstado(s);
      el.querySelector(".interruptor").setAttribute("aria-checked", String(s.on));

      const barra = el.querySelector(".comodo-barra span");
      const pct = Math.min(100, Math.max(4, ((s.temp - MIN) / (MAX - MIN)) * 100));
      barra.style.width = `${pct}%`;
      barra.style.setProperty("--cor-barra", corDaTemperatura(s.temp));
    });
  }

  render();
})();