import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const CAMINHO_TACO = "./src/data/taco.json";
const CAMINHO_TBCA = "./scripts/raw/tbca.csv";
const CAMINHO_POF = "./scripts/raw/TabelaPOF.xls";
const CAMINHO_SAIDA = "./public/data/alimentos.json";

const PREPOSICOES = new Set([
  "de", "da", "do", "das", "dos", "e", "a", "o", "as", "os", "em", "na", "no",
]);

// --- UTILITÁRIOS ---
const normalizar = (texto) =>
  String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const limparNumero = (valor) => {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? Number(valor.toFixed(1)) : 0;
  }
  if (!valor) return 0;
  const limpo = String(valor).replace(",", ".").trim();
  const numero = Number(limpo);
  return Number.isFinite(numero) ? Number(numero.toFixed(1)) : 0;
};

// Gera chave única independente da ordem das palavras e pontuação
const gerarChaveDedup = (nome) =>
  normalizar(nome)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((palavra) => palavra.length > 1 && !PREPOSICOES.has(palavra))
    .sort()
    .join(" ");

// Converte "ARROZ INTEGRAL" em "Arroz integral"
const formatarCaixaPof = (texto) => {
  const limpo = String(texto || "").trim().replace(/\s+/g, " ");
  if (!limpo) return "";
  const minusculo = limpo.toLowerCase();
  return minusculo.charAt(0).toUpperCase() + minusculo.slice(1);
};

// Lê arquivo texto tentando UTF-8 e caindo para Latin1 se houver acento quebrado
const lerTextoComEncoding = (caminho) => {
  const buffer = fs.readFileSync(caminho);
  const utf8 = buffer.toString("utf-8").replace(/^\uFEFF/, "");
  return utf8.includes("\uFFFD") ? buffer.toString("latin1") : utf8;
};

// Parser CSV que respeita campos entre aspas (ex: "Abacate, polpa" ou "5,84")
const parseLinhaCsv = (linha, separador) => {
  const colunas = [];
  let atual = "";
  let dentroAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const char = linha[i];
    if (char === '"') {
      if (dentroAspas && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentroAspas = !dentroAspas;
      }
    } else if (char === separador && !dentroAspas) {
      colunas.push(atual.trim());
      atual = "";
    } else {
      atual += char;
    }
  }
  colunas.push(atual.trim());
  return colunas;
};

// --- 1. LEITURA DA TACO (.json) ---
const carregarTaco = () => {
  const dados = JSON.parse(fs.readFileSync(CAMINHO_TACO, "utf-8"));
  return dados.map((item) => ({
    id: item.id,
    fonte: "TACO",
    nome: String(item.nome || "").trim(),
    calorias100g: Math.round(limparNumero(item.calorias100g)),
    proteina100g: limparNumero(item.proteina100g),
    carboidrato100g: limparNumero(item.carboidrato100g),
    gordura100g: limparNumero(item.gordura100g),
    fibra100g: limparNumero(item.fibra100g),
  }));
};

// --- 2. LEITURA DA TBCA (.csv) ---
const carregarTbca = () => {
  const conteudo = lerTextoComEncoding(CAMINHO_TBCA);
  const linhas = conteudo.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (linhas.length < 2) return [];

  const separador = linhas[0].includes(";") ? ";" : ",";
  const cabecalho = parseLinhaCsv(linhas[0], separador).map(normalizar);

  const idxCodigo = cabecalho.findIndex((c) => c.includes("codigo"));
  const idxNome = cabecalho.findIndex((c) => c.startsWith("alimento"));
  const idxKcal = cabecalho.findIndex((c) => c.includes("kcal") || c.includes("energia"));
  const idxCarb = cabecalho.findIndex((c) => c.includes("carboidrat"));
  const idxProt = cabecalho.findIndex((c) => c.includes("proteina"));
  const idxGord = cabecalho.findIndex((c) => c.includes("gordura") || c.includes("lipide"));
  const idxFibra = cabecalho.findIndex((c) => c.includes("fibra"));

  const itens = [];

  for (let i = 1; i < linhas.length; i++) {
    const col = parseLinhaCsv(linhas[i], separador);
    const nome = col[idxNome]?.trim();
    if (!nome) continue;

    itens.push({
      id: `tbca-${col[idxCodigo] || i}`,
      fonte: "TBCA",
      nome,
      calorias100g: Math.round(limparNumero(col[idxKcal])),
      proteina100g: limparNumero(col[idxProt]),
      carboidrato100g: limparNumero(col[idxCarb]),
      gordura100g: limparNumero(col[idxGord]),
      fibra100g: idxFibra >= 0 ? limparNumero(col[idxFibra]) : 0,
    });
  }

  return itens;
};

// --- 3. LEITURA DA IBGE POF (.xls) ---
const carregarPof = () => {
  const workbook = XLSX.readFile(CAMINHO_POF);
  const primeiraAba = workbook.SheetNames[0];
  const linhas = XLSX.utils.sheet_to_json(workbook.Sheets[primeiraAba], {
    header: 1,
    defval: "",
  });

  // Localiza dinamicamente a linha de cabeçalho pulando os títulos do topo
  const indiceCabecalho = linhas.findIndex((linha) => {
    const textos = linha.map(normalizar);
    return (
      textos.some((t) => t.includes("codigo") && t.includes("alimento")) &&
      textos.some((t) => t.includes("energia"))
    );
  });

  if (indiceCabecalho === -1) {
    throw new Error("Cabeçalho da tabela POF não encontrado no arquivo .xls.");
  }

  const cabecalho = linhas[indiceCabecalho].map(normalizar);

  const idxCodigo = cabecalho.findIndex((c) => c.includes("codigo") && c.includes("alimento"));
  const idxNome = cabecalho.findIndex((c) => c.includes("descricao") && c.includes("alimento"));
  const idxPrep = cabecalho.findIndex((c) => c.includes("descricao") && c.includes("preparacao"));
  const idxKcal = cabecalho.findIndex((c) => c.includes("energia") && c.includes("kcal"));
  const idxProt = cabecalho.findIndex((c) => c.includes("proteina"));
  const idxGord = cabecalho.findIndex((c) => c.includes("lipideo") || c.includes("lipidio"));
  const idxCarb = cabecalho.findIndex((c) => c.includes("carboidrat"));
  const idxFibra = cabecalho.findIndex((c) => c.includes("fibra"));

  const itens = [];
  const combinacoesVistas = new Set();

  for (let i = indiceCabecalho + 1; i < linhas.length; i++) {
    const col = linhas[i];
    const codigo = String(col[idxCodigo] || "").trim();
    const descricaoBruta = String(col[idxNome] || "").trim();
    if (!descricaoBruta) continue;

    const kcal = Math.round(limparNumero(col[idxKcal]));
    const prot = limparNumero(col[idxProt]);
    const carb = limparNumero(col[idxCarb]);
    const gord = limparNumero(col[idxGord]);
    const fibra = limparNumero(col[idxFibra]);

    const prepBruta = String(col[idxPrep] || "").trim();
    const prepNorm = normalizar(prepBruta);
    const temPrep = prepNorm && prepNorm !== "nao se aplica";

    const nomeBase = formatarCaixaPof(descricaoBruta);
    const nomeFinal = temPrep
      ? `${nomeBase} — ${prepBruta.toLowerCase()}`
      : nomeBase;

    // Evita repetir 5x o mesmo código POF quando só muda o preparo mas os macros são idênticos
    // (ex: Milho em grão cru/cozido/assado com valores exatamente iguais na tabela)
    const assinaturaMacro = `${codigo}|${kcal}|${prot}|${carb}|${gord}`;
    if (codigo && combinacoesVistas.has(assinaturaMacro)) {
      continue;
    }
    combinacoesVistas.add(assinaturaMacro);

    itens.push({
      id: `pof-${codigo || i}-${i}`,
      fonte: "IBGE",
      nome: nomeFinal,
      calorias100g: kcal,
      proteina100g: prot,
      carboidrato100g: carb,
      gordura100g: gord,
      fibra100g: fibra,
    });
  }

  return itens;
};

// --- 4. UNIFICAÇÃO SEM DUPLICADOS ---
const mapaUnico = new Map();
const stats = {
  TACO: 0,
  TBCA: 0,
  IBGE: 0,
  duplicadosDescartados: 0,
  fibrasEnriquecidas: 0,
};

const mesclarLista = (lista) => {
  for (const item of lista) {
    if (!item.nome || item.calorias100g <= 0) continue;

    const chave = gerarChaveDedup(item.nome);
    if (!chave) continue;

    if (mapaUnico.has(chave)) {
      // Se o item já salvo (ex: TBCA) estava sem fibra, aproveita a fibra da POF
      const existente = mapaUnico.get(chave);
      if (existente.fibra100g === 0 && item.fibra100g > 0) {
        existente.fibra100g = item.fibra100g;
        stats.fibrasEnriquecidas++;
      }
      stats.duplicadosDescartados++;
      continue;
    }

    mapaUnico.set(chave, item);
    stats[item.fonte]++;
  }
};

mesclarLista(carregarTaco());
mesclarLista(carregarTbca());
mesclarLista(carregarPof());

const resultadoFinal = Array.from(mapaUnico.values());

fs.mkdirSync(path.dirname(CAMINHO_SAIDA), { recursive: true });
fs.writeFileSync(CAMINHO_SAIDA, JSON.stringify(resultadoFinal));

const tamanhoKB = (fs.statSync(CAMINHO_SAIDA).size / 1024).toFixed(1);

console.log("=== Unificação concluída ===");
console.log(`TACO mantidos:          ${stats.TACO}`);
console.log(`TBCA adicionados:       ${stats.TBCA}`);
console.log(`IBGE (POF) adicionados: ${stats.IBGE}`);
console.log(`Duplicados removidos:   ${stats.duplicadosDescartados}`);
console.log(`Fibras enriquecidas:    ${stats.fibrasEnriquecidas}`);
console.log(`Total final:            ${resultadoFinal.length} alimentos (${tamanhoKB} KB)`);