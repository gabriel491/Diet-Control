# 🍃 Diet Control

Aplicação web progressiva (**PWA**) para controle diário de alimentação, calorias e macronutrientes, com uma base nutricional brasileira unificada de **6.963 alimentos** (**TACO + TBCA/USP + IBGE/POF**), carregamento sob demanda e fallback automático via **Open Food Facts Brasil**.

![Preview do Diet Control](./public/diet-control-og.jpg)

🔗 **Acesse em produção:** [diet-control-theta.vercel.app](https://diet-control-theta.vercel.app/)  
🌐 **Espelho GitHub Pages:** [gabriel491.github.io/Diet-Control](https://gabriel491.github.io/Diet-Control/)

---

## ✨ Funcionalidades

- **Painel de Meta Diária:** anel de progresso circular em SVG, barra horizontal de porcentagem, contador de calorias restantes (ou excedentes) e modal dedicado para definir ou editar a meta a qualquer momento.
- **Controle Completo de Macronutrientes:** cálculo automático de **Proteínas, Carboidratos, Gorduras e Fibras** tanto no resumo diário (com percentual aproximado sobre as calorias) quanto detalhado individualmente em cada alimento registrado na lista.
- **Base Nutricional Unificada e Busca Híbrida:**
  1. **Consulta local e offline:** busca com normalização de acentos, múltiplas palavras, ordenação por relevância e selo de origem (`TACO`, `TBCA` ou `IBGE`) em um JSON unificado carregado sob demanda (*lazy loading* com cache em memória).
  2. **Fallback online:** consulta automática na API do **Open Food Facts Brasil** (`br.openfoodfacts.org`) exibindo nome e marca de produtos industrializados caso o item não conste na base local.
- **Cálculo Proporcional por Grama:** atalhos rápidos (`50g`, `100g`, `150g`, `200g`) ou peso customizado com pré-visualização em tempo real de calorias e macros.
- **Cadastro Manual:** registro direto de alimentos personalizados com peso, calorias e macronutrientes opcionais.
- **Interface Mobile-First:** navegação por data, cards responsivos por refeição (**Café da Manhã**, **Almoço**, **Lanche** e **Jantar**) e botão de adição fixado acima da listagem para facilitar o registro contínuo no celular.
- **Instalável no Celular (PWA):** suporte a instalação na tela inicial (Android e iOS) em tela cheia e funcionamento offline via Service Worker.
- **Persistência Local:** histórico de refeições e meta diária salvos automaticamente no `localStorage`.

---

## 🛠️ Tecnologias Utilizadas

- **[React](https://react.dev/)** — construção da interface e gerenciamento de estado
- **[Vite](https://vitejs.dev/)** — bundler e ambiente de desenvolvimento
- **[Tailwind CSS](https://tailwindcss.com/)** — estilização responsiva *mobile-first* em tema escuro
- **[Lucide React](https://lucide.dev/)** — biblioteca de ícones
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — manifesto, Service Worker e cache offline
- **Node.js + [SheetJS (`xlsx`)](https://sheetjs.com/)** — script ETL para unificação, limpeza e deduplicação das tabelas nutricionais
- **TACO + TBCA (USP) + IBGE (POF)** + **[Open Food Facts Brasil](https://br.openfoodfacts.org/)** — dados nutricionais

---

## 🔄 Unificação das Bases Nutricionais

Para ampliar a variedade de alimentos sem pesar o carregamento inicial do app nem gerar itens repetidos, o projeto conta com o script `scripts/unificar-bases.mjs`, que processa os arquivos brutos (`.json`, `.csv` e `.xls`) em um único `public/data/alimentos.json` minificado:

| Métrica do Pipeline | Resultado |
| :--- | :---: |
| **TACO** (base prioritária mantida) | 589 |
| **TBCA (USP)** adicionados | 5.030 |
| **IBGE (POF)** adicionados | 1.344 |
| **Duplicados removidos** | 244 |
| **Fibras enriquecidas** (TBCA ← POF) | 30 |
| **Total final unificado** | **6.963 alimentos (`1.911,2 KB`)** |

- **Prioridade e deduplicação:** mescla na ordem **TACO → TBCA → IBGE**, comparando chaves normalizadas sem acentos, pontuação ou preposições para eliminar duplicatas mesmo com palavras em ordens diferentes.
- **Enriquecimento de dados:** aproveita valores de fibra alimentar da tabela POF (IBGE) quando um alimento equivalente vindo da TBCA não traz essa informação, além de remover linhas redundantes com macronutrientes idênticos.
- **Performance no PWA:** o JSON final fica fora do bundle JavaScript e é buscado via `fetch` apenas na primeira abertura do modal de registro, ficando em cache na memória e no Service Worker.

```bash
# Para regerar public/data/alimentos.json a partir das bases brutas em scripts/raw/
node scripts/unificar-bases.mjs
```
Um detalhe técnico importante sobre esse tamanho final: **`1.911,2 KB`** (~1,87 MB) passou raspando abaixo do limite padrão de **2 MB (`2.048 KB`)** do Workbox no `vite-plugin-pwa`. No build atual ele entra no cache offline normalmente, mas se no futuro você adicionar um `extras.json` e o `npm run build` acusar erro de arquivo grande no Service Worker, basta adicionar `workbox: { maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 }` dentro do `VitePWA({...})` no `vite.config.js`.

---

## 📂 Estrutura do Projeto

```text
Diet-Control/
├── public/
│   ├── data/
│   │   └── alimentos.json        # Base unificada e minificada (TACO + TBCA + IBGE)
│   ├── diet-control-og.jpg       # Imagem de preview Open Graph (1200x630)
│   ├── favicon.svg               # Ícone vetorial da aplicação
│   └── ...                       # Ícones PWA e favicons
├── scripts/
│   └── unificar-bases.mjs        # Script Node.js de ETL e deduplicação das bases
├── src/
│   ├── components/
│   │   ├── CardsCategorias.jsx   # Cards de Café da Manhã, Almoço, Lanche e Jantar
│   │   ├── Header.jsx            # Cabeçalho com identidade visual
│   │   ├── ListaVazia.jsx        # Cards de alimentos com macros detalhados e estado vazio
│   │   ├── ModalMeta.jsx         # Modal para definir e editar a meta calórica
│   │   ├── ModalRefeicao.jsx     # Modal com busca híbrida (lazy load) e cadastro manual
│   │   ├── ResumoDiario.jsx      # Anel de calorias, barra de meta e cards de macros
│   │   └── SeletorData.jsx       # Navegação entre dias registrados
│   ├── constants/
│   │   └── categorias.jsx        # Metadados, nomes, cores e ícones das categorias
│   ├── data/
│   │   └── taco.json             # Base TACO utilizada como origem na unificação
│   ├── App.jsx                   # Estado principal e composição da tela
│   └── main.jsx                  # Ponto de entrada React
├── index.html                    # Metatags de SEO, Open Graph e Twitter Card
└── vite.config.js                # Configuração do Vite, PWA e base path multi-host
```

---

## 🚀 Como Executar Localmente

Pré-requisito: [Node.js](https://nodejs.org/) (v18 ou superior).

```bash
# 1. Clone o repositório
git clone [https://github.com/gabriel491/Diet-Control.git](https://github.com/gabriel491/Diet-Control.git)

# 2. Acesse a pasta do projeto
cd Diet-Control

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

---

## 📦 Build e Deploy

O `vite.config.js` detecta automaticamente o ambiente via `process.env.VERCEL`, mantendo **Vercel** (`base: "/"`) e **GitHub Pages** (`base: "/Diet-Control/"`) sincronizados a partir do mesmo código.

```bash
# Gerar build de produção local
npm run build

# Publicar na Vercel (deploy automático pela branch main)
git push origin main

# Publicar no GitHub Pages
npm run deploy
```

---

## 📱 Instalação como App (PWA)

- **Android (Chrome):** acesse o link em produção, toque no menu `⋮` e selecione **Instalar aplicativo**.
- **iOS (Safari):** acesse o link, toque em **Compartilhar** e selecione **Adicionar à Tela de Início**.

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel Macêdo** — [@gabriel491](https://github.com/gabriel491)