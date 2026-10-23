/**
 * acessibilidade.js
 * -----------------------------------------------------------------
 * Comportamentos que o CSS puro (checkbox hack) não consegue cobrir
 * sozinho: sincronizar aria-expanded com o estado real do menu/dropdown,
 * gerenciar foco ao abrir/fechar o modal e permitir fechá-lo com Esc.
 *
 * iniciarMenuAcessivel() roda uma única vez, no carregamento da
 * aplicação — o cabeçalho é persistente e nunca é reconstruído pelo
 * roteador. iniciarModalAcessivel() precisa ser chamada de novo a cada
 * vez que a rota "inicio" é renderizada, porque o modal vive dentro do
 * <template> daquela rota e é reclonado a cada navegação.
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});

    function iniciarMenuAcessivel() {
        const menuToggle = document.getElementById('menu-toggle');
        const menuLabel = document.querySelector('.menu-toggle-label');

        if (menuToggle && menuLabel) {
            menuToggle.addEventListener('change', () => {
                menuLabel.setAttribute('aria-expanded', String(menuToggle.checked));
            });
        }

        // Cada item com submenu ganha aria-haspopup/aria-expanded,
        // sincronizados com o hover/foco que já controla a exibição
        // visual do dropdown via CSS.
        document.querySelectorAll('.menu-item-dropdown').forEach((item) => {
            const link = item.querySelector('a');
            if (!link) return;

            link.setAttribute('aria-haspopup', 'true');
            link.setAttribute('aria-expanded', 'false');

            const abrir = () => link.setAttribute('aria-expanded', 'true');
            const fechar = () => link.setAttribute('aria-expanded', 'false');

            item.addEventListener('mouseenter', abrir);
            item.addEventListener('mouseleave', fechar);
            item.addEventListener('focusin', abrir);
            item.addEventListener('focusout', (evento) => {
                if (!item.contains(evento.relatedTarget)) fechar();
            });
        });
    }

    function iniciarModalAcessivel() {
        const toggle = document.getElementById('modal-toggle');
        const modal = document.querySelector('.modal');
        const botaoAbrir = document.querySelector('.botao-abrir-modal');
        if (!toggle || !modal) return;

        // Move o foco para dentro do modal ao abrir (para o título, que
        // recebe tabindex="-1" só para ser um alvo de foco programático),
        // e devolve o foco ao botão que abriu o modal ao fechar — evita
        // que o foco "se perca" no topo da página, problema comum em
        // modais mal implementados.
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                const titulo = modal.querySelector('h3');
                if (titulo) titulo.focus();
            } else if (botaoAbrir) {
                botaoAbrir.focus();
            }
        });

        // Fechar com Esc é um comportamento padrão esperado em
        // qualquer diálogo modal por usuários de teclado.
        modal.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') {
                toggle.checked = false;
                toggle.dispatchEvent(new Event('change'));
            }
        });
    }

    ONG.acessibilidade = { iniciarMenuAcessivel, iniciarModalAcessivel };
})();
