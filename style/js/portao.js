(() => {
  "use strict";

  const estados = { garagem: false, social: false };
  const botaoGaragem = document.getElementById("botao-garagem");
  const botaoSocial = document.getElementById("botao-social");
  const botaoChamada = document.getElementById("botao-chamada");
  const titulo = document.getElementById("status-titulo");
  const mensagem = document.getElementById("status-mensagem");

  function atualizarPortao(tipo, botao, estadoId, fechado, aberto, frase) {
    estados[tipo] = !estados[tipo];
    botao.setAttribute("aria-pressed", String(estados[tipo]));
    document.getElementById(estadoId).textContent = estados[tipo] ? "Aberto" : "Fechado";
    document.getElementById(estadoId).classList.toggle("aberto", estados[tipo]);
    document.getElementById(`texto-${tipo}`).textContent = estados[tipo] ? aberto : fechado;
    titulo.textContent = estados[tipo] ? frase : "Acesso fechado.";
    mensagem.textContent = estados[tipo]
      ? `${tipo === "garagem" ? "Portão da garagem" : "Portãozinho"} aberto na simulação. Aperte novamente para fechar.`
      : "O acesso foi fechado. Aperte outro botão do controle para escolher uma função.";
    document.getElementById("marca-led").style.background = estados[tipo] ? "#e3cf58" : "#72d188";
  }

  botaoGaragem.addEventListener("click", () => atualizarPortao("garagem", botaoGaragem, "estado-garagem", "Portão", "Fechar portão", "Portão aberto!"));
  botaoSocial.addEventListener("click", () => atualizarPortao("social", botaoSocial, "estado-social", "Portãozinho", "Fechar portãozinho", "Portãozinho aberto!"));

  botaoChamada.addEventListener("click", () => {
    const ativa = botaoChamada.getAttribute("aria-pressed") !== "true";
    botaoChamada.setAttribute("aria-pressed", String(ativa));
    document.getElementById("texto-chamada").textContent = ativa ? "Encerrar chamada" : "Interfone";
    document.getElementById("status-interfone").textContent = ativa ? "Chamada em andamento" : "Falar com visitante";
    titulo.textContent = ativa ? "Chamando lá fora…" : "Interfone encerrado.";
    mensagem.textContent = ativa ? "A chamada está ativa na simulação. Aperte novamente para encerrar." : "Use os botões do controle para acionar uma função.";
    document.getElementById("marca-led").style.background = ativa ? "#72d188" : "#72d188";
  });
})();
