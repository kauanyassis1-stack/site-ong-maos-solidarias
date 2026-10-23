/**
 * build.js
 * -----------------------------------------------------------------
 * Bundler/minificador próprio do projeto, escrito em Node.js puro
 * (sem dependências externas para esta parte — só a otimização de
 * imagens, em otimizar-imagens.js, usa um pacote de terceiros: sharp).
 *
 * Por que um script próprio em vez de Webpack/Vite/Parcel?
 * O projeto foi construído deliberadamente com scripts clássicos
 * (sem ES Modules) organizados sob um namespace global único (ONG),
 * justamente para funcionar sem build nenhum durante o desenvolvimento
 * (inclusive abrindo direto via file://). Isso significa que o único
 * ganho real que um bundler traria para produção é: (1) concatenar os
 * 7 arquivos JS em 1 só, reduzindo requisições HTTP, e (2) minificar
 * CSS/JS/HTML. Um bundler completo (Webpack/Vite) resolveria isso,
 * mas embutiria uma cadeia de configuração (loaders, plugins, resolução
 * de módulos) desproporcional ao problema real do projeto — por isso
 * optei por escrever as ~80 linhas que realmente resolvem o problema,
 * mantendo o processo de build 100% transparente e auditável.
 *
 * Uso: node build.js
 * Gera a pasta dist/ com index.html, css/ e js/ prontos para produção.
 * (Imagens são tratadas à parte por otimizar-imagens.js, que depende
 * do pacote sharp — ver README.)
 */
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DIST = path.join(RAIZ, 'dist');

// ---------- Minificador de CSS ----------
function minificarCss(codigo) {
    codigo = codigo.replace(/\/\*[\s\S]*?\*\//g, '');
    codigo = codigo.replace(/\s+/g, ' ');
    codigo = codigo.replace(/\s*([{}:;,>])\s*/g, '$1');
    codigo = codigo.replace(/;}/g, '}');
    return codigo.trim();
}

// ---------- Minificador de JS ----------
// Conservador: remove comentários // e /* */ e colapsa espaços,
// percorrendo caractere a caractere para nunca tocar em conteúdo
// dentro de strings ou template literals (uma regex ingênua quebraria
// em casos como "https://" ou um template literal com "//" dentro).
function minificarJs(codigo) {
    let resultado = '';
    let dentroString = null;
    const n = codigo.length;

    for (let i = 0; i < n; i++) {
        const c = codigo[i];

        if (dentroString) {
            resultado += c;
            if (c === '\\' && i + 1 < n) {
                resultado += codigo[i + 1];
                i++;
                continue;
            }
            if (c === dentroString) dentroString = null;
            continue;
        }

        if (c === "'" || c === '"' || c === '`') {
            dentroString = c;
            resultado += c;
            continue;
        }

        if (c === '/' && codigo[i + 1] === '/') {
            while (i < n && codigo[i] !== '\n') i++;
            continue;
        }

        if (c === '/' && codigo[i + 1] === '*') {
            i += 2;
            while (i + 1 < n && !(codigo[i] === '*' && codigo[i + 1] === '/')) i++;
            i++;
            continue;
        }

        resultado += c;
    }

    return resultado
        .split('\n')
        .map((linha) => linha.trim())
        .filter(Boolean)
        .join('\n');
}

// ---------- Minificador de HTML ----------
function minificarHtml(codigo) {
    codigo = codigo.replace(/<!--[\s\S]*?-->/g, '');
    codigo = codigo.replace(/>\s+</g, '><');
    codigo = codigo.replace(/[ \t\n\r]+/g, ' ');
    return codigo.trim();
}

function tamanho(str) {
    return Buffer.byteLength(str, 'utf-8');
}

function build() {
    fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
    fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });
    
    // --- CSS ---
    const cssOriginal = fs.readFileSync(path.join(RAIZ, 'css/style.css'), 'utf-8');
    const cssMin = minificarCss(cssOriginal);
    fs.writeFileSync(path.join(DIST, 'css/style.min.css'), cssMin);
    console.log(`css/style.css: ${tamanho(cssOriginal)} -> ${tamanho(cssMin)} bytes`);

    // --- JS: bundle (ordem de dependência) + minificação ---
    const ordem = ['templates', 'componentes', 'formulario', 'acessibilidade', 'tema', 'router', 'app'];
    const bundle = ordem
        .map((nome) => fs.readFileSync(path.join(RAIZ, `js/${nome}.js`), 'utf-8'))
        .join('\n');
    const bundleMin = minificarJs(bundle);
    fs.writeFileSync(path.join(DIST, 'js/app.min.js'), bundleMin);
    console.log(`js/ (${ordem.length} módulos bundlados): ${tamanho(bundle)} -> ${tamanho(bundleMin)} bytes`);

    // --- HTML: ajusta caminhos de build e minifica ---
    let html = fs.readFileSync(path.join(RAIZ, 'html/index.html'), 'utf-8');
    const htmlOriginalTamanho = tamanho(html);

    html = html.replace('href="../css/style.css"', 'href="css/style.min.css"');
    html = html.replace(/\.\.\/imagens\//g, 'imagens/');

    const scriptsDev = ordem
        .map((nome) => `    <script src="../js/${nome}.js"></script>`)
        .join('\n');
    const cdnImask = '    <script src="https://cdn.jsdelivr.net/npm/imask@7.6.1/dist/imask.min.js"></script>\n';
    const blocoDev = cdnImask + scriptsDev;
    const blocoProd =
        '    <script src="https://cdn.jsdelivr.net/npm/imask@7.6.1/dist/imask.min.js" defer></script>\n' +
        '    <script src="js/app.min.js" defer></script>';

    if (!html.includes(blocoDev)) {
        throw new Error('Bloco de <script> não encontrado no formato esperado — build abortado.');
    }
    html = html.replace(blocoDev, blocoProd);

    const htmlMin = minificarHtml(html);
    // Na raiz de dist/, para o site abrir direto no endereço do GitHub Pages
    fs.writeFileSync(path.join(DIST, 'index.html'), htmlMin);
    console.log(`html/index.html: ${htmlOriginalTamanho} -> ${tamanho(htmlMin)} bytes`);

    const totalOriginal = tamanho(cssOriginal) + tamanho(bundle) + htmlOriginalTamanho;
    const totalMin = tamanho(cssMin) + tamanho(bundleMin) + tamanho(htmlMin);
    console.log(`\nTotal (CSS+JS+HTML): ${totalOriginal} -> ${totalMin} bytes`);
    console.log(`Redução: ${(100 * (1 - totalMin / totalOriginal)).toFixed(1)}%`);
    console.log('\nLembrete: rode "npm run otimizar-imagens" separadamente para gerar dist/imagens/.');
}

build();
