# ONG Mãos Solidárias

Site institucional em formato de Single Page Application (SPA) para uma
organização fictícia do terceiro setor, desenvolvido como projeto
acadêmico incremental. Permite divulgar projetos sociais, captar
voluntários através de um formulário validado e apresentar os canais de
contato e doação da organização.

**Acesse o site:** https://kauanyassis1-stack.github.io/site-ong-maos-solidarias/

## Tecnologias utilizadas

- **HTML5** semântico (`<header>`, `<nav>`, `<main>`, `<section>`,
  `<footer>`, `<template>`)
- **CSS3**, com Design System próprio: variáveis customizadas (cores,
  tipografia, espaçamento), Grid de 12 colunas, Flexbox e breakpoints
  responsivos mobile-first
- **JavaScript puro (Vanilla JS)**, sem frameworks, organizado em
  módulos por responsabilidade
- **[IMask.js](https://imask.js.org/)** (via CDN) — máscaras de campo
  para CPF, telefone e CEP
- **localStorage** — persistência dos voluntários cadastrados, sem
  necessidade de back-end

## Estrutura de pastas

```
site-ong-maos-solidarias/
├── .github/workflows/
│   └── deploy.yml        # build e deploy automático no GitHub Pages
├── html/
│   └── index.html        # shell da SPA + templates de cada rota
├── css/
│   └── style.css         # Design System completo
├── imagens/              # logo e ilustrações dos projetos (autorais)
├── js/
│   ├── templates.js      # clonagem de <template> e injeção no DOM
│   ├── componentes.js    # exibir/esconder alertas e toast
│   ├── formulario.js     # validação, máscaras e localStorage
│   ├── acessibilidade.js # foco, teclado e leitores de tela
│   ├── tema.js           # modo de alto contraste
│   ├── router.js         # roteamento por hash (núcleo da SPA)
│   └── app.js            # ponto de entrada
├── build.js              # minificação e bundle para produção
├── otimizar-imagens.js   # conversão para WebP e redimensionamento
├── package.json
└── README.md
```

Cada módulo em `js/` resolve um único tipo de problema (ver seção
"Práticas de versionamento" e o histórico de commits para o raciocínio
por trás dessa separação).

## Pré-requisitos

- Um navegador atualizado (Chrome, Firefox ou Edge)
- Conexão à internet (necessária apenas para carregar o IMask.js via CDN)
- Opcional: [Visual Studio Code](https://code.visualstudio.com/) com a
  extensão **Live Server**

Não há dependências para instalar via `npm` — o projeto não usa
bundler nem gerenciador de pacotes.

## Instalação e execução local

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>

# 2. Entrar na pasta do projeto
cd site-ong-maos-solidarias
```

Depois, escolha uma das opções:

- **Opção A (recomendada):** abra a pasta no VS Code, clique com o
  botão direito em `html/index.html` e selecione **"Open with Live
  Server"**.
- **Opção B:** abra `html/index.html` diretamente no navegador (duplo
  clique) — o projeto foi construído para funcionar mesmo via `file://`.

Não há passo de build: os arquivos são servidos como estão.

## Funcionalidades

- Navegação SPA com roteamento por hash (`#/inicio`, `#/projetos`,
  `#/cadastro`) e submenus com âncora (`#/projetos/doacoes`)
- Menu responsivo com dropdown (desktop) e hambúrguer (mobile), em CSS puro
- Formulário de cadastro de voluntários com validação em três camadas
  (HTML5, CSS, JavaScript) e máscaras automáticas de CPF/telefone/CEP
- Persistência dos cadastros em `localStorage`, com lista dos
  voluntários já registrados naquele dispositivo
- Componentes de feedback padronizados: badges, alertas contextuais,
  toast e modal informativo

## Práticas de versionamento

O repositório segue o modelo **GitFlow**:

- `main` — apenas versões estáveis, cada uma marcada com tag de
  versionamento semântico
- `develop` — branch de integração contínua
- `feature/*` — uma branch por funcionalidade, criada a partir de
  `develop` e mesclada de volta via Pull Request
- `hotfix/*` — correções urgentes, criadas a partir de `main` e
  mescladas em `main` e `develop` simultaneamente

Os commits seguem o padrão **Conventional Commits**
(`feat:`, `fix:`, `style:`, `refactor:`, `docs:`), e as entregas usam
**versionamento semântico** (`MAJOR.MINOR.PATCH`):

| Versão | Marco |
|---|---|
| `v1.0.0` | Site estático completo (HTML/CSS), antes da migração para SPA |
| `v2.0.0` | Migração para Single Page Application (mudança estrutural) |
| `v2.1.0` | Validação de formulário e persistência em localStorage |
| `v2.2.0` | Integração do IMask.js para máscaras de campo |

## Build de produção

O projeto usa um script de build próprio (`build.js`), em vez de um
bundler como Webpack/Vite — justificativa completa na resposta da
etapa correspondente, mas em resumo: como o projeto não usa ES
Modules nem dependências npm no runtime, o único ganho real de um
bundler seria concatenar e minificar os arquivos, o que ~150 linhas
de Node.js puro resolvem de forma transparente e auditável.

```bash
npm install          # só instala o sharp, usado na otimização de imagens
npm run build        # gera dist/index.html, dist/css e dist/js minificados
npm run otimizar-imagens   # gera dist/imagens (WebP + JPEG redimensionados)
```

Resultado típico (medido neste projeto):

| Categoria | Original | Produção | Redução |
|---|---|---|---|
| CSS + JS + HTML | 60.972 bytes | 34.051 bytes | ~44% |
| Imagens (4 fotos) | 23,8 MB | ~1,25 MB | ~95% |

## Deploy

Hospedado no **GitHub Pages**, com deploy automático via GitHub
Actions (`.github/workflows/deploy.yml`): todo push em `main` roda
`npm run build` + `npm run otimizar-imagens` e publica o conteúdo de
`dist/`. Para habilitar em um novo repositório: Settings → Pages →
Source → "GitHub Actions".

## Roadmap

- [ ] Integração com back-end real (API de cadastro)
- [ ] Testes automatizados (unitários e de interface)
- [ ] Deploy em ambiente de produção
- [ ] Revisão de acessibilidade conforme WCAG 2.1 (Nível AA)

## Autoria

Projeto desenvolvido por Kauany Gabrielly Muniz de Assis como atividade
acadêmica.


