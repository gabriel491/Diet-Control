import { useEffect, useState } from "react";
import { Search, Flame } from "lucide-react";

let cacheAlimentos = null;
let promessaAlimentos = null;

const carregarBaseAlimentos = () => {
  if (cacheAlimentos) return Promise.resolve(cacheAlimentos);
  if (!promessaAlimentos) {
    promessaAlimentos = fetch(`${import.meta.env.BASE_URL}data/alimentos.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar alimentos.json");
        return res.json();
      })
      .then((dados) => {
        cacheAlimentos = dados;
        return dados;
      })
      .catch(() => {
        promessaAlimentos = null;
        return [];
      });
  }
  return promessaAlimentos;
};

const opcoesPeso = [50, 100, 150, 200];

const normalizarTexto = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const calcularProporcao = (valor100g, gramas) =>
  Number((((Number(valor100g) || 0) * (Number(gramas) || 0)) / 100).toFixed(1));

function ModalRefeicao({ onClose, onSalvarRefeicao, categoriaSelecionada }) {
  // --- ESTADOS DO FORMULÁRIO MANUAL ---
  const [name, setName] = useState("");
  const [peso, setPeso] = useState("");
  const [calorias, setCalorias] = useState("");
  const [proteinas, setProteinas] = useState("");
  const [carboidratos, setCarboidratos] = useState("");
  const [gorduras, setGorduras] = useState("");
  const [fibras, setFibras] = useState("");
  const [categoria, setCategoria] = useState(
    categoriaSelecionada || "cafe_da_manha",
  );

  // --- ESTADOS DA BUSCA ---
  const [abaAtiva, setAbaAtiva] = useState("busca");
  const [termoBusca, setTermoBusca] = useState("");
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(100);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");
  const [baseAlimentos, setBaseAlimentos] = useState(cacheAlimentos || []);

  useEffect(() => {
    let ativo = true;
    carregarBaseAlimentos().then((dados) => {
      if (ativo) setBaseAlimentos(dados);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const caloriasEstimadas = alimentoSelecionado
    ? Math.round((alimentoSelecionado.calorias100g * quantidade) / 100)
    : 0;

  const macrosEstimados = alimentoSelecionado
    ? {
        proteinas: calcularProporcao(
          alimentoSelecionado.proteina100g,
          quantidade,
        ),
        carboidratos: calcularProporcao(
          alimentoSelecionado.carboidrato100g,
          quantidade,
        ),
        gorduras: calcularProporcao(
          alimentoSelecionado.gordura100g,
          quantidade,
        ),
        fibras: calcularProporcao(alimentoSelecionado.fibra100g, quantidade),
      }
    : { proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0 };

  // --- BUSCA HÍBRIDA (BASE UNIFICADA + OPEN FOOD FACTS) ---
  const buscarAlimentos = async () => {
    const termoLimpo = termoBusca.trim();
    if (termoLimpo === "") {
      return;
    }

    setErroBusca("");

    // Garante que a base local terminou de carregar antes de filtrar
    const baseAtual =
      baseAlimentos.length > 0 ? baseAlimentos : await carregarBaseAlimentos();

    // 1. Consulta na base local unificada (TACO + TBCA + IBGE)
    const termoNormalizado = normalizarTexto(termoLimpo);
    const palavrasBusca = termoNormalizado.split(/\s+/);

    const resultadosLocais = baseAtual
      .filter((alimento) => {
        const nomeNormalizado = normalizarTexto(alimento.nome);
        return palavrasBusca.every((palavra) =>
          nomeNormalizado.includes(palavra),
        );
      })
      .sort((a, b) => {
        const nomeA = normalizarTexto(a.nome);
        const nomeB = normalizarTexto(b.nome);
        const aComeca = nomeA.startsWith(termoNormalizado) ? 0 : 1;
        const bComeca = nomeB.startsWith(termoNormalizado) ? 0 : 1;
        if (aComeca !== bComeca) return aComeca - bComeca;
        return nomeA.length - nomeB.length;
      })
      .slice(0, 20);

    if (resultadosLocais.length > 0) {
      setResultadosBusca(resultadosLocais);
      return;
    }

    // 2. Fallback: busca na API Open Food Facts (BR)
    const url = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      termoLimpo,
    )}&search_simple=1&action=process&json=1&page_size=15&lc=pt&countries_tags_en=brazil&fields=code,product_name,brands,nutriments`;

    setCarregando(true);

    try {
      const resposta = await fetch(url);
      const dados = await resposta.json();

      const produtos = dados.products || [];
      const resultadosApi = produtos
        .filter(
          (produto) =>
            produto.product_name &&
            produto.nutriments?.["energy-kcal_100g"] > 0,
        )
        .map((produto, index) => {
          const marcaPrincipal = produto.brands?.split(",")[0]?.trim();
          return {
            id: produto.code || `api-${index}`,
            fonte: "API",
            nome: marcaPrincipal
              ? `${produto.product_name} (${marcaPrincipal})`
              : produto.product_name,
            calorias100g: Math.round(produto.nutriments["energy-kcal_100g"]),
            proteina100g: Number(produto.nutriments.proteins_100g || 0),
            carboidrato100g: Number(produto.nutriments.carbohydrates_100g || 0),
            gordura100g: Number(produto.nutriments.fat_100g || 0),
            fibra100g: Number(produto.nutriments.fiber_100g || 0),
          };
        });

      if (resultadosApi.length === 0) {
        setErroBusca("Nenhum alimento com calorias foi encontrado.");
      }

      setResultadosBusca(resultadosApi);
    } catch {
      setErroBusca("Não foi possível buscar os alimentos. Tente novamente.");
      setResultadosBusca([]);
    } finally {
      setCarregando(false);
    }
  };

  // --- ENVIOS PARA O APP.JSX ---
  const salvarManual = (e) => {
    e.preventDefault();
    onSalvarRefeicao({
      nome: name,
      peso: Number(peso),
      calorias: Number(calorias),
      proteinas: Number(proteinas) || 0,
      carboidratos: Number(carboidratos) || 0,
      gorduras: Number(gorduras) || 0,
      fibras: Number(fibras) || 0,
      categoria,
    });
  };

  const salvarBuscado = () => {
    if (!alimentoSelecionado) {
      return;
    }

    onSalvarRefeicao({
      nome: alimentoSelecionado.nome,
      peso: quantidade,
      calorias: caloriasEstimadas,
      proteinas: macrosEstimados.proteinas,
      carboidratos: macrosEstimados.carboidratos,
      gorduras: macrosEstimados.gorduras,
      fibras: macrosEstimados.fibras,
      categoria: categoriaSelecionada || "cafe_da_manha",
    });
  };

  return (
    <div
      onClick={onClose}
      className="modal fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0F0F] border border-[#262626] text-[#F8F8F8] p-6 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold cursor-pointer"
        >
          X
        </button>

        <h2 className="text-xl font-bold mb-4 text-[#F8F8F8]">
          Registrar Alimento
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            className={`py-2 rounded-full font-semibold text-sm cursor-pointer transition-colors ${
              abaAtiva === "busca"
                ? "bg-[#5DD62C] text-[#0F0F0F]"
                : "bg-[#202020] text-gray-400"
            }`}
            onClick={() => setAbaAtiva("busca")}
          >
            Busca de Alimentos
          </button>

          <button
            type="button"
            className={`py-2 rounded-full font-semibold text-sm cursor-pointer transition-colors ${
              abaAtiva === "manual"
                ? "bg-[#5DD62C] text-[#0F0F0F]"
                : "bg-[#202020] text-gray-400"
            }`}
            onClick={() => setAbaAtiva("manual")}
          >
            Cadastro Manual
          </button>
        </div>

        {abaAtiva === "busca" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 bg-[#202020] px-3 py-2.5 rounded-xl border border-transparent focus-within:border-[#5DD62C]">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    buscarAlimentos();
                  }
                }}
                placeholder="Buscar alimento..."
                className="bg-transparent outline-none w-full text-[#F8F8F8] placeholder-gray-500"
              />
              <button
                type="button"
                onClick={buscarAlimentos}
                className="bg-[#5DD62C] text-[#0F0F0F] px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Buscar
              </button>
            </div>

            {carregando && <p className="text-sm text-gray-400">Buscando...</p>}

            {erroBusca !== "" && (
              <p className="text-sm text-red-400">{erroBusca}</p>
            )}

            {resultadosBusca.length > 0 && (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {resultadosBusca.map((produto) => {
                  const caloriasProporcionais = Math.round(
                    (produto.calorias100g * quantidade) / 100,
                  );

                  return (
                    <button
                      key={produto.id}
                      type="button"
                      onClick={() => {
                        setAlimentoSelecionado({
                          nome: produto.nome,
                          fonte: produto.fonte,
                          calorias100g: produto.calorias100g,
                          proteina100g: produto.proteina100g || 0,
                          carboidrato100g: produto.carboidrato100g || 0,
                          gordura100g: produto.gordura100g || 0,
                          fibra100g: produto.fibra100g || 0,
                        });
                        setResultadosBusca([]);
                      }}
                      className="flex justify-between items-center gap-2 p-2.5 bg-[#202020] hover:bg-[#337418] text-white rounded-lg text-left text-sm cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate text-white">
                          {produto.nome || "Sem nome"}
                        </span>
                        {produto.fonte && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-gray-400 border border-[#303030] shrink-0">
                            {produto.fonte}
                          </span>
                        )}
                      </div>
                      <span className="text-[#5DD62C] font-semibold shrink-0">
                        {caloriasProporcionais} kcal
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {alimentoSelecionado && (
              <div className="bg-[#202020] p-3 rounded-xl border border-[#5DD62C] flex flex-col gap-2">
                <div>
                  <p className="font-semibold text-[#F8F8F8]">
                    {alimentoSelecionado.nome}
                  </p>
                  <span className="text-xs text-[#5DD62C]">
                    {caloriasEstimadas} kcal ({quantidade || 0}g) • base:{" "}
                    {alimentoSelecionado.calorias100g} kcal/100g
                    {alimentoSelecionado.fonte
                      ? ` • ${alimentoSelecionado.fonte}`
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#303030] text-center text-xs">
                  <div>
                    <span className="text-sky-400 font-semibold block">
                      {macrosEstimados.proteinas}g
                    </span>
                    <span className="text-gray-400 text-[10px]">Prot.</span>
                  </div>
                  <div>
                    <span className="text-amber-400 font-semibold block">
                      {macrosEstimados.carboidratos}g
                    </span>
                    <span className="text-gray-400 text-[10px]">Carb.</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold block">
                      {macrosEstimados.gorduras}g
                    </span>
                    <span className="text-gray-400 text-[10px]">Gord.</span>
                  </div>
                  <div>
                    <span className="text-[#5DD62C] font-semibold block">
                      {macrosEstimados.fibras}g
                    </span>
                    <span className="text-gray-400 text-[10px]">Fibras</span>
                  </div>
                </div>
              </div>
            )}

            <label className="text-sm text-gray-400">Quantidade (g)</label>
            <input
              type="number"
              min={1}
              step={1}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full p-3 bg-[#202020] text-[#F8F8F8] rounded-xl border border-transparent focus:border-[#5DD62C] outline-none"
            />

            <div className="grid grid-cols-4 gap-2">
              {opcoesPeso.map((gramas) => (
                <button
                  key={gramas}
                  type="button"
                  onClick={() => setQuantidade(gramas)}
                  className={`py-2 rounded-full font-semibold text-sm cursor-pointer transition-colors ${
                    quantidade === gramas
                      ? "bg-[#5DD62C] text-[#0F0F0F]"
                      : "bg-[#202020] text-gray-400"
                  }`}
                >
                  {gramas}g
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-[#202020] p-4 rounded-xl">
              <span>Calorias estimadas: </span>
              <span className="flex items-center gap-1 text-[#5DD62C] font-bold text-lg">
                <Flame size={18} />
                {caloriasEstimadas} kcal
              </span>
            </div>

            <button
              type="button"
              onClick={salvarBuscado}
              disabled={!alimentoSelecionado}
              className={`font-bold p-2 rounded transition-colors mt-2 ${
                alimentoSelecionado
                  ? "bg-[#5DD62C] text-[#0F0F0F] hover:bg-[#337418] hover:text-[#F8F8F8] cursor-pointer"
                  : "bg-[#202020] text-gray-500 cursor-not-allowed"
              }`}
            >
              Adicionar Refeição
            </button>
          </div>
        )}

        {abaAtiva === "manual" && (
          <form onSubmit={salvarManual} className="flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do alimento"
              required
              className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
            />
            <input
              type="number"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Peso em Gramas"
              required
              className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
            />
            <input
              type="number"
              value={calorias}
              onChange={(e) => setCalorias(e.target.value)}
              placeholder="Calorias (kcal)"
              required
              className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={proteinas}
                onChange={(e) => setProteinas(e.target.value)}
                placeholder="Proteínas (g)"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500 text-sm"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                value={carboidratos}
                onChange={(e) => setCarboidratos(e.target.value)}
                placeholder="Carboidratos (g)"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500 text-sm"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                value={gorduras}
                onChange={(e) => setGorduras(e.target.value)}
                placeholder="Gorduras (g)"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500 text-sm"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                value={fibras}
                onChange={(e) => setFibras(e.target.value)}
                placeholder="Fibras (g)"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500 text-sm"
              />
            </div>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded"
            >
              <option value="cafe_da_manha">Café da Manhã</option>
              <option value="almoco">Almoço</option>
              <option value="lanche">Lanche</option>
              <option value="janta">Jantar</option>
            </select>

            <button className="bg-[#5DD62C] text-[#0F0F0F] font-bold p-2 rounded hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors mt-2 cursor-pointer">
              Salvar Refeição
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ModalRefeicao;