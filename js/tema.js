/**
 * tema.js
 * -----------------------------------------------------------------
 * Alterna entre o tema padrão e o modo de alto contraste, aplicando
 * o atributo data-tema="escuro" na <html> (é ele que ativa as
 * variáveis definidas em :root[data-tema="escuro"] no style.css).
 *
 * Prioridade na escolha do tema inicial:
 *   1) preferência já salva pelo usuário no localStorage;
 *   2) na ausência dela, a preferência do sistema operacional
 *      (prefers-color-scheme: dark), como ponto de partida razoável;
 *   3) por fim, o tema padrão (claro).
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});
    const CHAVE_STORAGE = 'ong-maos-solidarias:tema';

    function obterTemaSalvo() {
        try {
            return localStorage.getItem(CHAVE_STORAGE);
        } catch (erro) {
            console.error('Não foi possível ler a preferência de tema salva:', erro);
            return null;
        }
    }

    function salvarTema(tema) {
        try {
            localStorage.setItem(CHAVE_STORAGE, tema);
        } catch (erro) {
            console.error('Não foi possível salvar a preferência de tema:', erro);
        }
    }

    function aplicarTema(tema) {
        const botao = document.getElementById('alternar-tema');

        if (tema === 'escuro') {
            document.documentElement.setAttribute('data-tema', 'escuro');
        } else {
            document.documentElement.removeAttribute('data-tema');
        }

        if (botao) {
            botao.setAttribute('aria-pressed', String(tema === 'escuro'));
        }
    }

    function iniciar() {
        const preferenciaDoSistema = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const temaSalvo = obterTemaSalvo();
        const temaInicial = temaSalvo || (preferenciaDoSistema ? 'escuro' : 'claro');

        aplicarTema(temaInicial);

        const botao = document.getElementById('alternar-tema');
        if (!botao) return;

        botao.addEventListener('click', () => {
            const temaAtual = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
            const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';
            aplicarTema(novoTema);
            salvarTema(novoTema);
        });
    }

    ONG.tema = { iniciar };
})();
