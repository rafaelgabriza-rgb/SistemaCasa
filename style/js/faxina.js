(() => {
  "use strict";

  const botao = document.getElementById("solicitar-faxina");
  const status = document.getElementById("faxina-status");

  botao.addEventListener("click", () => {
    status.textContent = "Solicitação de faxina enviada!";
    botao.textContent = "Solicitação enviada";
    botao.disabled = true;
  });
})();
