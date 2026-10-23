/**
 * app.js
 * -----------------------------------------------------------------
 * Ponto de entrada da aplicação. Único responsável por "ligar" a
 * SPA — não contém regra de negócio nenhuma, só inicializa o módulo
 * de roteamento (que, por sua vez, já dispara a primeira renderização
 * assim que o DOM estiver pronto).
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});
    ONG.tema.iniciar();
    ONG.acessibilidade.iniciarMenuAcessivel();
    ONG.router.iniciar();
})();
