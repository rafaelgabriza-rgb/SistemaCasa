(() => {
  "use strict";

  const botaoAlarme = document.getElementById("botao-alarme");
  const cartaoAlarme = document.getElementById("cartao-alarme");
  const botaoTrava = document.getElementById("botao-trava");
  const cartaoTrava = document.getElementById("cartao-trava");

  function atualizarEstadoGeral() {
    const protegido = botaoAlarme.getAttribute("aria-checked") === "true";
    const trancada = botaoTrava.getAttribute("aria-pressed") === "true";
    const geral = document.getElementById("estado-geral");
    const texto = document.getElementById("texto-geral");
    const ativo = protegido || trancada;
    geral.classList.toggle("seguro", ativo);
    texto.textContent = protegido && trancada ? "Casa protegida" : protegido ? "Alarme ligado" : trancada ? "Casa trancada" : "Sistema desativado";
  }

  botaoAlarme.addEventListener("click", () => {
    const ligado = botaoAlarme.getAttribute("aria-checked") !== "true";
    botaoAlarme.setAttribute("aria-checked", String(ligado));
    botaoAlarme.setAttribute("aria-label", ligado ? "Desligar alarme" : "Ligar alarme");
    cartaoAlarme.dataset.ativo = String(ligado);
    document.getElementById("alarme-titulo").textContent = ligado ? "Alarme ligado" : "Alarme desligado";
    document.getElementById("alarme-desc").textContent = ligado ? "A casa está sendo monitorada pelo alarme." : "A casa não está sendo monitorada pelo alarme.";
    atualizarEstadoGeral();
  });

  botaoTrava.addEventListener("click", () => {
    const trancada = botaoTrava.getAttribute("aria-pressed") !== "true";
    botaoTrava.setAttribute("aria-pressed", String(trancada));
    cartaoTrava.dataset.trancada = String(trancada);
    document.getElementById("trava-titulo").textContent = trancada ? "Casa trancada" : "Casa destrancada";
    document.getElementById("trava-desc").textContent = trancada ? "As portas estão simuladas como trancadas." : "As portas estão simuladas como destrancadas.";
    document.getElementById("texto-trava").textContent = trancada ? "Destrancar casa" : "Trancar casa";
    atualizarEstadoGeral();
  });

  document.querySelectorAll(".camera-video video").forEach((video) => {
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });
})();
