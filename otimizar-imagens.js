// Script de otimização de imagens para produção.
// Uso: node otimizar-imagens.js <pasta-origem> <pasta-destino>
// Gera, para cada imagem: uma versão WebP (formato principal) e uma
// versão JPEG (fallback), ambas redimensionadas para a maior largura
// realmente usada no layout (.imagem-secao ocupa no máximo ~900px em
// telas grandes — servir 3024px de largura seria desperdício de dados).

const sharp = require('sharp'); // npm install sharp
const fs = require('fs');
const path = require('path');

const LARGURA_MAXIMA = 900; // px — cobre até telas retina em cards de ~450px
const QUALIDADE_WEBP = 78;
const QUALIDADE_JPG = 80;

const [, , pastaOrigem, pastaDestino] = process.argv;

fs.mkdirSync(pastaDestino, { recursive: true });

const arquivos = fs.readdirSync(pastaOrigem).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

(async () => {
    let totalAntes = 0;
    let totalDepois = 0;

    for (const arquivo of arquivos) {
        const nomeBase = path.parse(arquivo).name;
        const origemPath = path.join(pastaOrigem, arquivo);
        const tamanhoAntes = fs.statSync(origemPath).size;
        totalAntes += tamanhoAntes;

        const destinoWebp = path.join(pastaDestino, `${nomeBase}.webp`);
        const destinoJpg = path.join(pastaDestino, `${nomeBase}.jpg`);

        await sharp(origemPath)
            .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
            .webp({ quality: QUALIDADE_WEBP })
            .toFile(destinoWebp);

        await sharp(origemPath)
            .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
            .jpeg({ quality: QUALIDADE_JPG, mozjpeg: true })
            .toFile(destinoJpg);

        // PNGs (como o logo) também são referenciados pelo nome original
        // no HTML, então geramos uma cópia .png redimensionada com o mesmo
        // nome — sem isso, o logo quebraria no site publicado.
        if (/\.png$/i.test(arquivo)) {
            await sharp(origemPath)
                .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
                .png({ compressionLevel: 9 })
                .toFile(path.join(pastaDestino, arquivo));
        }

        const tamanhoWebp = fs.statSync(destinoWebp).size;
        const tamanhoJpg = fs.statSync(destinoJpg).size;
        totalDepois += tamanhoWebp; // WebP é o formato servido por padrão

        console.log(
            `${arquivo}: ${(tamanhoAntes/1024/1024).toFixed(2)}MB -> ` +
            `webp ${(tamanhoWebp/1024).toFixed(0)}KB | jpg (fallback) ${(tamanhoJpg/1024).toFixed(0)}KB`
        );
    }

    console.log(`\nTotal antes:  ${(totalAntes/1024/1024).toFixed(2)} MB`);
    console.log(`Total depois: ${(totalDepois/1024/1024).toFixed(2)} MB (somando só os .webp servidos)`);
    console.log(`Reducao: ${(100*(1-totalDepois/totalAntes)).toFixed(1)}%`);
})();
