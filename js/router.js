/**
 * router.js
 * -----------------------------------------------------------------
 * Núcleo da navegação de página única. Escolhido roteamento por
 * HASH (#/rota) em vez da History API (pushState), porque:
 *  - funciona sem nenhum servidor, inclusive abrindo o arquivo
 *    direto no navegador (file://), o que a History API não
 *    garante (recarregar uma URL "limpa" como /projetos exigiria
 *    configuração de servidor para sempre devolver o index.html);
 *  - o próprio navegador já dispara o evento "hashchange" quando o
 *    usuário clica em um <a href="#/rota">, então não é necessário
 *    interceptar cliques com preventDefault() em cada link — a
 *    "interceptação" acontece ouvindo esse evento, e é a partir dele
 *    que decidimos o que renderizar, em vez de deixar o navegador
 *    simplesmente pular para um id da página.
 *
 * Formato aceito no hash: #/rota ou #/rota/ancora
 * Exemplos: #/inicio  |  #/projetos/doacoes
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});

    const rotas = {
        inicio: { template: 'template-inicio', titulo: 'Início' },
        projetos: { template: 'template-projetos', titulo: 'Projetos Sociais' },
        cadastro: { template: 'template-cadastro', titulo: 'Cadastro de Voluntários' }
    };

    // Funções específicas que cada rota precisa rodar DEPOIS que o
    // template correspondente é injetado no DOM (ligar formulário,
    // buscar dados salvos etc.). Rotas sem comportamento próprio nem
    // precisam aparecer aqui.
    const iniciarRota = {
        inicio: () => ONG.acessibilidade.iniciarModalAcessivel(),
        cadastro: () => ONG.formulario.iniciar()
    };

    function obterRotaAtual() {
        const hash = window.location.hash.replace(/^#\/?/, '');
        const [rota, ancora] = hash.split('/');
        return { rota: rota || 'inicio', ancora };
    }

    function atualizarLinkAtivo(nomeRota) {
        document.querySelectorAll('[data-rota]').forEach((link) => {
            const ativo = link.dataset.rota === nomeRota;
            link.classList.toggle('link-ativo', ativo);
            if (ativo) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function fecharMenuMobile() {
        const menuToggle = document.getElementById('menu-toggle');
        if (!menuToggle || !menuToggle.checked) return;

        // Setar .checked diretamente NÃO dispara "change" — sem isso,
        // o aria-expanded sincronizado em acessibilidade.js ficaria
        // preso em "true" mesmo com o menu já fechado visualmente.
        menuToggle.checked = false;
        menuToggle.dispatchEvent(new Event('change'));
    }

    function renderizarRota() {
        const { rota, ancora } = obterRotaAtual();
        const nomeRotaValida = rotas[rota] ? rota : 'inicio';
        const dadosRota = rotas[nomeRotaValida];
        const app = document.getElementById('app');

        ONG.templates.renderizar(dadosRota.template, app);
        document.title = `ONG Mãos Solidárias — ${dadosRota.titulo}`;
        atualizarLinkAtivo(nomeRotaValida);
        fecharMenuMobile();

        if (iniciarRota[nomeRotaValida]) {
            iniciarRota[nomeRotaValida]();
        }

        if (ancora) {
            const alvo = document.getElementById(ancora);
            if (alvo) {
                alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }

        window.scrollTo({ top: 0 });
    }

    function iniciar() {
        window.addEventListener('hashchange', renderizarRota);
        window.addEventListener('DOMContentLoaded', renderizarRota);
    }

    ONG.router = { iniciar };
})();
