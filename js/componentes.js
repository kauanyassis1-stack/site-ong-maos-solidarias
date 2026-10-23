/**
 * componentes.js
 * -----------------------------------------------------------------
 * Funções genéricas para mostrar/esconder os componentes de feedback
 * (alertas e toast) definidos no style.css. Não sabem nada sobre
 * formulário nenhum especificamente — por isso ficam em módulo à
 * parte, reutilizável por qualquer rota que precise dar feedback ao
 * usuário no futuro.
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});

    let temporizadorToast = null;

    function esconderElementos(...ids) {
        ids.forEach((id) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.hidden = true;
        });
    }

    function mostrarElemento(id) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.hidden = false;
    }

    function mostrarToastTemporario(id, duracaoMs = 4000) {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        clearTimeout(temporizadorToast);
        elemento.hidden = false;
        temporizadorToast = setTimeout(() => {
            elemento.hidden = true;
        }, duracaoMs);
    }

    function cancelarToast(id) {
        clearTimeout(temporizadorToast);
        const elemento = document.getElementById(id);
        if (elemento) elemento.hidden = true;
    }

    ONG.componentes = {
        esconderElementos,
        mostrarElemento,
        mostrarToastTemporario,
        cancelarToast
    };
})();
