/**
 * templates.js
 * -----------------------------------------------------------------
 * Responsabilidade única: pegar um <template id="..."> já presente
 * no HTML, clonar o conteúdo dele e injetar dentro de um elemento
 * container (no nosso caso, a <main id="app">).
 *
 * Optou-se pela clonagem do elemento <template> nativo do HTML5 em
 * vez de Template Literals com innerHTML porque:
 *  - a marcação de cada "página" continua vivendo no HTML, legível
 *    e validável, em vez de virar strings gigantes dentro do JS;
 *  - o conteúdo de um <template> não é renderizado nem processado
 *    pelo navegador até ser clonado, então é seguro guardar formulários,
 *    inputs e ids ali dentro sem duplicação prematura no DOM;
 *  - cloneNode(true) gera nós de DOM reais (não strings), então não
 *    há necessidade de reserializar/reparsear HTML a cada navegação.
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});

    function renderizar(idTemplate, elementoContainer) {
        const template = document.getElementById(idTemplate);

        elementoContainer.innerHTML = '';

        if (!template) {
            elementoContainer.innerHTML = '<p>Página não encontrada.</p>';
            return;
        }

        const clone = template.content.cloneNode(true);
        elementoContainer.appendChild(clone);
    }

    ONG.templates = { renderizar };
})();
