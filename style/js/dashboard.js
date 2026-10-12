// Saudação e relógio do painel
(function () {
  const saudacao = document.getElementById("saudacao");
  const hora = document.getElementById("hora");
  const data = document.getElementById("data");

  function atualizar() {
    const agora = new Date();
    const h = agora.getHours();

    if (saudacao) {
      saudacao.textContent =
        h < 5 ? "Boa madrugada, Rafael" :
        h < 12 ? "Bom dia, Rafael" :
        h < 18 ? "Boa tarde, Rafael" : "Boa noite, Rafael";
    }

    if (hora) {
      hora.textContent = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (data) {
      data.textContent = agora.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }

  atualizar();
  setInterval(atualizar, 15000);
})();