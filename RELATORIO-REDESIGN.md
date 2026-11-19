# VALORA — Relatório do redesign

Documento com tudo o que foi alterado no front-end do VALORA durante a etapa de redesign (sidebar, Home, Login e padronização visual), além de um guia de Git/fork no final.

> **Escopo desta etapa:** somente front-end (`src/`). O back-end (`backend/`) **não foi alterado**.
> **Importante:** as alterações foram construídas e validadas com `vite build`. A conferência visual no navegador foi feita por você, por prints, ao longo do processo. Itens marcados como "não testado" na seção de limitações merecem uma checagem manual antes da apresentação.

---

## 1. Como o projeto está organizado

O VALORA não é um site em HTML puro. É uma aplicação em camadas:

| Camada | Onde fica | O que faz |
|---|---|---|
| Front-end | `src/` | React (JSX) + Vite. Telas, rotas (React Router) e CSS. |
| Serviços | `src/servicos/` | Funções que chamam a API via `fetch` (`equipamentoServico`, `setorServico`, `manutencaoServico`...). O `pontuacaoServico` contém a regra de cálculo do Score de saúde. |
| Back-end | `backend/` | API Express + Prisma + PostgreSQL (Neon). CRUD de equipamentos, setores, localizações, fornecedores, manutenções e tarefas. |

Detalhes úteis:

- O que parece HTML dentro das páginas é **JSX**; o único `index.html` é uma casca com `<div id="root">`.
- Cada página tem o seu CSS em `src/paginas/css/`. Todos os CSS são carregados globalmente (SPA), então regras de uma página podem afetar outras.
- O Score exibido no painel é **calculado no front** a partir do histórico de manutenções, não vem do banco.
- O Tailwind está instalado, mas **não é usado** (o `index.css` não importa `@import "tailwindcss"`). O projeto inteiro usa CSS puro.

---

## 2. Resumo das alterações

1. **Sidebar nova**: degradê, logo em imagem, botões marrons, item inicial em destaque, menu e rodapé que acompanham a rolagem.
2. **Rodapé da sidebar**: cartão da conta (expansível, com sair), atalho "Exportar relatório" e versão do sistema.
3. **Home**: fonte nova, subtextos maiores, botão principal laranja.
4. **Arquivo de padronização** (`padrao.css`): cor, fonte, remoção de itálico e botões consistentes em todas as páginas.
5. **Exportar relatório** em CSV, gerado no navegador.
6. **Sessão visual** (sem autenticação real) ligando Login, cartão da conta e botão sair.
7. **Login redesenhado**: degradê, logo à direita, fontes padronizadas, slogan maior.

---

## 3. Detalhamento

### 3.1 Sidebar (`src/componentes/sidebar.jsx` e `sidebar.css`)

- **CSS movido:** as regras da sidebar (classes `dash-*`) saíram do `Home.css` e foram para `src/componentes/sidebar.css`, importado pelo próprio componente. Antes, mexer na sidebar exigia abrir o CSS da Home.
- **Degradê vertical:** `linear-gradient(180deg, #a84f0f 0%, #c8692a 30%, #e3a07a 70%, #f1bb9f 100%)` — laranja queimado no topo, pêssego claro embaixo.
- **Logo:** o `<h1>VALORA</h1>` virou a imagem `src/img/valora-logo.png`, com cantos arredondados.
- **Botões do menu:** fundo `#92480c`, sombra leve, texto branco em negrito; item ativo `#5c2900` com borda branca translúcida; submenu `#6f3200`.
- **Bloco "Olá, Pablo" removido:** o avatar e a saudação com nome fixo saíram. A prop `nomeUsuario = 'Pablo'` foi apagada da assinatura do componente (nenhuma página a usava).
- **Item inicial em destaque:** o primeiro item do menu ganhou `destaque: true`, é renderizado em duas linhas (`<br />`), com `display: block`, texto centralizado e padding/fonte maiores que os demais. O texto exibido foi ajustado pela equipe para "Painel Principal". **Atenção:** o campo `rotulo` do item precisa continuar igual ao valor que as páginas passam na prop `ativo`, senão o item deixa de ficar destacado.
- **Menu que acompanha a rolagem:** `.dash-sidebar nav { position: sticky; top: 24px; }`. A logo rola normalmente; só os botões acompanham. Funciona porque a sidebar ocupa a altura total da página (grid com `min-height: 100vh`).

### 3.2 Rodapé da sidebar

Estrutura (`.dash-rodape`, com `margin-top: auto` para ficar no fim e `position: sticky; bottom: 24px` para acompanhar a rolagem):

1. **Cartão da conta** (`.dash-conta`):
   - Botão do perfil (`.dash-conta-perfil`): avatar com iniciais, nome, cargo ("Administrador") e seta. Ao clicar, abre um menu **para cima** com "Configurações da conta" (leva a `/configuracoes`).
   - Botão **sair** (`.dash-conta-sair`) separado, sempre visível. Fica um pouco apagado e, no hover, ganha fundo claro, ícone vermelho e `filter: brightness(1.15)` para chamar atenção.
2. **Atalho "Exportar relatório"** (`.dash-atalho`): link em texto com ícone, sem fundo; o fundo só aparece no hover.
3. **Versão** (`.dash-versao`): texto "VALORA v1.0.0", pequeno e translúcido. A versão está escrita direto no JSX.

Observação técnica: dentro do `<button>` do perfil foram usados `<span>` e `<small>` (e não `<div>`), porque HTML não aceita `div` dentro de `button`.

### 3.3 Exportar relatório (`src/servicos/relatorioServico.js`)

- Busca equipamentos, setores e manutenções (mesmos serviços do painel) e calcula o Score com `calcularSaudeEquipamento` — **a mesma regra da Home**, sem duplicar lógica.
- Gera um CSV no navegador e dispara o download: `relatorio-equipamentos-AAAA-MM-DD.csv`.
- **Colunas:** Patrimônio, Equipamento, Tipo, Marca, Modelo, Setor, Status, Score, Classificação, Manutenções, Valor (R$), Data de aquisição.
- **Ordenação:** menores scores primeiro.
- **Compatibilidade com Excel em português:** separador `;`, BOM UTF-8 no início (acentos corretos), valores e datas no formato pt-BR, escape de aspas/quebras de linha.
- Em caso de erro (por exemplo, API fora do ar), exibe um `alert` e registra no console.

### 3.4 Sessão visual (`src/servicos/sessaoServico.js`)

Não existe login real no projeto (a tela de Login só navegava para `/` e o back-end não tem tabela de usuários). Foi criada uma sessão **apenas visual**:

- `salvarSessao(usuario)`: guarda o nome digitado no `localStorage` (chave `valora-usuario`), formatado (`ryan.silva@x.com` → "Ryan Silva").
- `lerSessao()`: devolve o nome; se não houver, a sidebar mostra "Visitante".
- `encerrarSessao()`: remove o nome (usado pelo botão sair, que volta para `/login`).
- `obterIniciais(nome)`: gera as iniciais do avatar.
- No `Login.jsx`, a linha `console.log('Login: ...')` foi trocada por `salvarSessao(usuario)`.

### 3.5 Home (`src/paginas/css/Home.css`, `index.html`)

- **Fonte nova:** Plus Jakarta Sans, carregada pelo Google Fonts no `index.html` (pesos 400 a 800). A `Inter` ficou como reserva.
- **Subtextos maiores:** +0,1rem em todos os textos menores que 1rem a partir do cabeçalho (rótulos e descrições dos cards, subtítulos dos painéis, legenda do Score, tabelas, pílulas de status, links "Ver todas"). Títulos e números grandes ficaram iguais.
- **Botão principal ("Consultar equipamentos"):** passou de `#8a3f00` para o laranja `#c84b00`.
- **Limpeza:** removida a declaração inválida `font-style: roboto mono, monospace`.

### 3.6 Padronização (`src/estilos/padrao.css`)

Arquivo novo, importado **por último** no `main.jsx` para valer sobre o CSS de cada página:

```js
// src/main.jsx — manter por último entre os imports
import './estilos/padrao.css'
```

Conteúdo:

- **Variáveis:** `--cor-primaria: #c84b00`, `--cor-primaria-hover: #a83e00`, `--fonte-sistema` (Plus Jakarta Sans → Inter → fontes do sistema).
- **Fonte única** em `.dash`, `.detalhes-layout` (telas de detalhes, que usavam Roboto) e `.lg-pagina` (Login); botões e inputs herdam a fonte.
- **Sem itálico**, com a regra `.dash.dash *`, `.detalhes-layout.detalhes-layout *` e `.lg-pagina.lg-pagina *`. A classe repetida é proposital: aumenta a especificidade para vencer seletores como `.fn-tabela-caixa th` ou `.lg-campo > span`.
- **Botões "Adicionar"** (`.eq-adicionar`, `.fn-adicionar`, `.lc-adicionar`, `.st-adicionar`, `.mt-adicionar`): mesmo tamanho, fonte e cor laranja da Home.
- **Botões "Salvar" dos modais** (`.fn-salvar`, `.lc-salvar`, `.st-salvar`, `.nm-salvar`): mesma cor primária.
- Estilos do rodapé da sidebar, cartão da conta e menu da conta.
- Estilos do Login (seção 3.7).

### 3.7 Login (`src/paginas/Login.jsx` + regras em `padrao.css`)

- **Painel esquerdo** com o mesmo degradê da sidebar. O final do degradê é um tom mais escuro (`#d9834f`) que o da sidebar, porque os textos pequenos brancos da parte de baixo ficariam ilegíveis sobre o pêssego claro (`#f1bb9f`).
- **Logo movida para o lado direito**, centralizada no topo do formulário (largura 230px, margem `8px 0 36px`). O ícone de usuário e o título "Bem Vindo" foram removidos.
- **Slogan** "Gestão inteligente de ativos de TI." agora é o primeiro elemento do painel esquerdo, maior (`2rem`, peso 600).
- **Fontes** de "Usuário", "Senha", "Lembrar-me", "Esqueceu sua Senha?" e botões padronizadas (sem itálico).
- **"Entrar" e "Cadastre-se"** deixaram de ser em caixa alta, como os botões do menu.
- O `Login.css` original **não foi editado**; tudo foi feito por sobreposição em `padrao.css`.

---

## 4. Arquivos

### Criados

| Arquivo | Para quê |
|---|---|
| `src/estilos/padrao.css` | Padrão visual compartilhado (cor, fonte, botões, rodapé da sidebar, Login) |
| `src/componentes/sidebar.css` | CSS da sidebar (antes dentro do `Home.css`) |
| `src/img/valora-logo.png` | Logo usada na sidebar e no Login |
| `src/servicos/relatorioServico.js` | Geração e download do CSV de equipamentos |
| `src/servicos/sessaoServico.js` | Sessão visual (nome do usuário no `localStorage`) |

### Modificados

| Arquivo | O que mudou |
|---|---|
| `src/componentes/sidebar.jsx` | Logo, item em destaque, rodapé, cartão da conta, exportar, sair; prop `nomeUsuario` removida |
| `src/paginas/css/Home.css` | Regras da sidebar removidas; fonte; subtextos maiores; botão laranja |
| `src/paginas/Login.jsx` | `salvarSessao`, logo no lado direito, avatar e "Bem Vindo" removidos |
| `src/main.jsx` | Import do `padrao.css` (por último) |
| `index.html` | Link do Google Fonts (Plus Jakarta Sans) |

---

## 5. Paleta e tokens

| Uso | Cor |
|---|---|
| Degradê da sidebar | `#a84f0f` → `#c8692a` → `#e3a07a` → `#f1bb9f` |
| Degradê do Login (esquerda) | `#a84f0f` → `#c8692a` → `#d9834f` |
| Botão do menu | `#92480c` |
| Item ativo / avatar | `#5c2900` |
| Submenu | `#6f3200` |
| Primária (botões principais) | `#c84b00` (hover `#a83e00`) |
| Texto do rodapé/cartão | `#3b1d0a` |

---

## 6. Limitações conhecidas

- **Sessão apenas visual.** Não há autenticação: depois de sair, qualquer página ainda abre digitando a URL. O cargo "Administrador" é fixo no código.
- **Exportar relatório depende da API.** Com o back-end fora do ar, aparece o aviso de erro.
- **A versão "v1.0.0" está fixa no JSX.** Precisa ser editada manualmente a cada release.
- **Menu da conta não fecha ao clicar fora** (só ao clicar de novo no cartão ou ao navegar).
- **Sticky (menu e rodapé) não testado em telas muito baixas**, onde menu e rodapé podem se encostar.
- **Fonte via Google Fonts** exige internet; sem ela, cai nas fontes de reserva.
- **O botão da Home** ainda tem a cor fixa no CSS (`#c84b00`); para acompanhar o padrão, usar `var(--cor-primaria)` e `var(--cor-primaria-hover)`.
- **Botões "Salvar" das telas de editar** (`nv-salvar`) não foram padronizados (têm variações próprias).
- **Títulos e cards** das demais páginas ainda estão no visual antigo.

---

## 7. Problemas encontrados e correções

- **Pasta `src` substituída por engano.** Ao copiar o zip de alterações por cima do projeto, a pasta `src` inteira foi substituída (erro `Failed to load url /src/main.jsx`). Recuperado e, a partir daí, as alterações passaram a ser aplicadas arquivo por arquivo. **Lição:** nunca arrastar a pasta `src` inteira; copiar arquivo por arquivo e fazer commit antes de qualquer mudança grande.
- **Itálico que não saía.** A primeira versão da regra `.dash *` não vencia seletores mais específicos (`th`, `h3`, `input`, `span` dentro de classes). Corrigido com a classe repetida (`.dash.dash *`).
- **`salvarSessao` virando texto.** A chamada foi colada dentro de `console.log('...')`, imprimindo texto em vez de executar. Corrigido: a chamada precisa ficar sozinha na linha.
- **Rodapé antes do `<nav>`.** Com o bloco `.dash-rodape` antes do menu, o `margin-top: auto` empurrava o menu para baixo. A ordem correta é: logo → `<nav>` → rodapé.
- **Import não resolvido** (`relatorioServico`): era o arquivo ainda não copiado para `src/servicos/`; o erro antigo continuava no terminal.

---

## 8. Próximos passos

- Redesenhar as listagens: **Setores, Localizações, Fornecedores** (e Equipamentos, Manutenções), aproveitando o padrão da Home.
- Redesenhar telas de **detalhes** e **formulários** (novo/editar).
- Telas soltas: **Analytics**, **Configurações**.
- Ligar o botão da Home às variáveis do `padrao.css`.
- Padronizar títulos e cards das demais páginas.
- Decidir se haverá autenticação real (tabela de usuários, senha com hash, token na API).
- Opcional: fechar o menu da conta ao clicar fora; exportar também em PDF.


