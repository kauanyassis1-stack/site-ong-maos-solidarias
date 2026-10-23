/**
 * formulario.js
 * -----------------------------------------------------------------
 * Toda a lógica específica da rota "cadastro": validação com
 * feedback visual, gravação e leitura de voluntários no localStorage.
 *
 * iniciar() é chamada pelo roteador logo depois que o template de
 * cadastro é injetado em #app — os elementos só existem no DOM a
 * partir desse momento, então os listeners precisam ser religados
 * a cada navegação (não é possível anexá-los uma única vez no
 * carregamento da página, como seria em um site multi-página).
 */
(function () {
    const ONG = window.ONG || (window.ONG = {});
    const CHAVE_STORAGE = 'ong-maos-solidarias:voluntarios';

    function obterVoluntarios() {
        try {
            const dados = localStorage.getItem(CHAVE_STORAGE);
            return dados ? JSON.parse(dados) : [];
        } catch (erro) {
            console.error('Não foi possível ler os voluntários salvos:', erro);
            return [];
        }
    }

    function salvarVoluntario(voluntario) {
        const lista = obterVoluntarios();
        lista.push(voluntario);
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
        return lista;
    }

    function renderizarListaVoluntarios() {
        const container = document.getElementById('lista-voluntarios');
        if (!container) return;

        const lista = obterVoluntarios();

        if (lista.length === 0) {
            container.innerHTML = '<li class="texto-auxiliar">Nenhum voluntário cadastrado neste dispositivo ainda.</li>';
            return;
        }

        // Template literal + innerHTML: forma mais simples de transformar
        // um array de objetos em marcação repetida, sem precisar de um
        // <template> específico para um item tão pequeno.
        container.innerHTML = lista
            .map((voluntario) => `
                <li>
                    <strong>${voluntario.nome}</strong> — ${voluntario.cidade}/${voluntario.estado}
                    <span class="badge badge-neutra">${voluntario.dataCadastro}</span>
                </li>
            `)
            .join('');
    }

    function aplicarMascaras() {
        // IMask formata o campo em tempo real: o usuário só digita números
        // e os símbolos (. - ()) são inseridos automaticamente. O atributo
        // pattern do HTML continua como camada extra de validação no submit.
        if (!window.IMask) return;

        const campoCpf = document.getElementById('cpf');
        const campoTelefone = document.getElementById('telefone');
        const campoCep = document.getElementById('cep');

        if (campoCpf) IMask(campoCpf, { mask: '000.000.000-00' });
        if (campoTelefone) IMask(campoTelefone, { mask: '(00) 00000-0000' });
        if (campoCep) IMask(campoCep, { mask: '00000-000' });
    }

    function iniciar() {
        const form = document.getElementById('form-cadastro');
        if (!form) return;

        aplicarMascaras();
        renderizarListaVoluntarios();

        // Enquanto o usuário preenche (e nenhum resultado de envio está
        // sendo exibido), mostra o alerta informativo.
        form.addEventListener('focusin', () => {
            const erroVisivel = !document.getElementById('alerta-erro').hidden;
            const sucessoVisivel = !document.getElementById('alerta-sucesso').hidden;
            if (!erroVisivel && !sucessoVisivel) {
                ONG.componentes.mostrarElemento('alerta-info');
            }
        });

        // Se o usuário volta a digitar depois de um resultado de envio,
        // os alertas de resultado somem e a dica informativa volta.
        form.addEventListener('input', () => {
            const erroVisivel = !document.getElementById('alerta-erro').hidden;
            const sucessoVisivel = !document.getElementById('alerta-sucesso').hidden;
            if (erroVisivel || sucessoVisivel) {
                ONG.componentes.esconderElementos('alerta-info', 'alerta-erro', 'alerta-sucesso');
                ONG.componentes.mostrarElemento('alerta-info');
            }
        });

        // "invalid" não borbulha (bubble) por padrão, então o listener
        // precisa ser registrado na fase de captura (terceiro argumento
        // true) para pegar o evento de qualquer campo dentro do form.
        form.addEventListener('invalid', (evento) => {
            evento.target.setAttribute('aria-invalid', 'true');
        }, true);

        form.addEventListener('input', (evento) => {
            if (evento.target.checkValidity && evento.target.checkValidity()) {
                evento.target.removeAttribute('aria-invalid');
            }
        });

        form.addEventListener('submit', (evento) => {
            evento.preventDefault();
            ONG.componentes.esconderElementos('alerta-info', 'alerta-erro', 'alerta-sucesso');

            if (form.checkValidity()) {
                const dados = new FormData(form);
                salvarVoluntario({
                    nome: dados.get('nome'),
                    email: dados.get('email'),
                    cidade: dados.get('cidade'),
                    estado: dados.get('estado'),
                    dataCadastro: new Date().toLocaleDateString('pt-BR')
                });

                ONG.componentes.mostrarElemento('alerta-sucesso');
                ONG.componentes.mostrarToastTemporario('toast-sucesso');
                form.reset();
                form.querySelectorAll('[aria-invalid]').forEach((campo) => campo.removeAttribute('aria-invalid'));
                renderizarListaVoluntarios();
            } else {
                ONG.componentes.mostrarElemento('alerta-erro');
                form.reportValidity();
            }
        });

        const botaoFecharToast = document.getElementById('toast-fechar-botao');
        if (botaoFecharToast) {
            botaoFecharToast.addEventListener('click', () => {
                ONG.componentes.cancelarToast('toast-sucesso');
            });
            botaoFecharToast.addEventListener('keydown', (evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                    evento.preventDefault();
                    ONG.componentes.cancelarToast('toast-sucesso');
                }
            });
        }
    }

    ONG.formulario = { iniciar };
})();
