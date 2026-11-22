# 🍃 Diet Control

Aplicação web responsiva para acompanhamento diário de alimentação, controle de calorias e visualização de macronutrientes, com consulta rápida à **Tabela TACO** e busca complementar via **Open Food Facts**.

🔗 **[Acessar na Vercel (Principal)](https://diet-control-theta.vercel.app/)** • **[Acessar no GitHub Pages](https://gabriel491.github.io/Diet-Control/)**

![Preview do Diet Control](./public/diet-control-og.jpg)

---

## ✨ Funcionalidades

- **🎯 Meta Diária de Calorias:** definição e edição da meta diária com anel de progresso circular (SVG), barra percentual e contador dinâmico de calorias restantes (ou excedidas).
- **🥗 Resumo de Macronutrientes:** cálculo automático diário de **Proteínas**, **Carboidratos**, **Gorduras** e **Fibras** em gramas e percentual aproximado sobre as calorias consumidas.
- **🔍 Busca Híbrida de Alimentos:**
  - **Prioridade local (Tabela TACO):** pesquisa instantânea com normalização de acentos e cálculo proporcional por grama.
  - **Fallback online (Open Food Facts API):** consulta automática na base global quando o alimento não é encontrado na tabela local.
- **✍️ Cadastro Manual:** permite registrar alimentos personalizados com peso, calorias e macronutrientes opcionais.
- **⚡ Porções Rápidas:** atalhos de `50g`, `100g`, `150g` e `200g` com prévia de calorias e macros em tempo real.
- **🍽️ Organização por Refeições:** cards interativos para **Café da Manhã**, **Almoço**, **Lanche** e **Jantar**, com filtro por categoria e remoção de itens.
- **📅 Histórico por Data:** seletor de datas para registrar e consultar refeições de dias anteriores.
- **💾 Persistência Local:** todas as refeições e a meta diária ficam salvas automaticamente no `localStorage` do navegador.
- **📱 Interface Mobile-First:** tema escuro focado em legibilidade e uso confortável em dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

- **[React](https://react.dev/)** — construção da interface baseada em componentes e gerenciamento de estado
- **[Vite](https://vite.dev/)** — bundler e ambiente de desenvolvimento
- **[Tailwind CSS](https://tailwindcss.com/)** — estilização utilitária e responsividade
- **[Lucide React](https://lucide.dev/)** — biblioteca de ícones
- **Tabela TACO (JSON local)** — base nutricional brasileira (por 100g)
- **[Open Food Facts API](https://world.openfoodfacts.org/)** — API pública utilizada como fallback de busca

---

## 📂 Estrutura do Projeto

```text
Diet-Control/
├── public/
│   ├── diet-control-og.jpg      # Imagem de preview (Open Graph / Twitter Card)
│   ├── favicon.svg              # Ícone vetorial da aplicação
│   └── ...                      # Favicons e manifesto web
├── src/
│   ├── components/
│   │   ├── CardsCategorias.jsx  # Cards de Café da Manhã, Almoço, Lanche e Jantar
│   │   ├── Header.jsx           # Cabeçalho com marca Diet Control
│   │   ├── ListaVazia.jsx       # Listagem de alimentos registrados e estado vazio
│   │   ├── ModalMeta.jsx        # Modal para definir/editar a meta calórica diária
│   │   ├── ModalRefeicao.jsx    # Modal de busca híbrida e cadastro manual
│   │   ├── ResumoDiario.jsx     # Anel de calorias, barra de progresso e card de macros
│   │   └── SeletorData.jsx      # Navegação e seleção de datas
│   ├── constants/
│   │   └── categorias.jsx       # Nomes, cores e ícones das categorias de refeição
│   ├── data/
│   │   └── taco.json            # Dados nutricionais da Tabela TACO
│   ├── App.jsx                  # Estado global, filtros e composição da tela
│   └── main.jsx                 # Ponto de entrada da aplicação
├── index.html                   # Metatags de SEO, Open Graph e fontes
└── vite.config.js               # Configuração do Vite com detecção Vercel / GitHub Pages
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- `npm`

### Passos

1. Clone o repositório:
   ```bash
   git clone [https://github.com/gabriel491/Diet-Control.git](https://github.com/gabriel491/Diet-Control.git)
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd Diet-Control
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Para gerar a versão de produção:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy (Vercel + GitHub Pages)

O arquivo `vite.config.js` detecta automaticamente o ambiente de build pela variável `process.env.VERCEL`, ajustando o `base` para `"/"` na Vercel e `"/Diet-Control/"` no GitHub Pages:

- **Vercel (Produção):** deploy automático a cada push na branch `main`:
  ```bash
  git push origin main
  ```
- **GitHub Pages:** publicação manual na branch `gh-pages`:
  ```bash
  npm run deploy
  ```

---

## 🗺️ Próximos Passos

- [ ] Exibir o detalhamento de macronutrientes em cada item da lista de refeições
- [ ] Adicionar edição de alimentos já registrados
- [ ] Transformar em PWA instalável com suporte offline completo (`vite-plugin-pwa`)
- [ ] Permitir exportar e importar histórico em JSON

---

## 👨‍💻 Autor

Desenvolvido por **[Gabriel Macêdo](https://github.com/gabriel491)**.