import { useState } from "react";
import { Search, Flame } from "lucide-react";
import alimentosTaco from "../data/taco.json";

const opcoesPeso = [50, 100, 150, 200];

const normalizarTexto = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function ModalRefeicao({ onClose, onSalvarRefeicao, categoriaSelecionada }) {
  // --- ESTADOS DO FORMULÁRIO MANUAL ---
  const [name, setName] = useState("");
  const [peso, setPeso] = useState("");
  const [calorias, setCalorias] = useState("");
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

  const caloriasEstimadas = alimentoSelecionado
    ? Math.round((alimentoSelecionado.calorias100g * quantidade) / 100)
    : 0;

  // --- BUSCA HÍBRIDA (TACO + OPEN FOOD FACTS) ---
  const buscarAlimentos = async () => {
    const termoLimpo = termoBusca.trim();
    if (termoLimpo === "") {
      return;
    }

    setErroBusca("");

    // 1. Consulta primeiro na tabela local (TACO)
    const palavrasBusca = normalizarTexto(termoLimpo).split(/\s+/);
    const resultadosLocais = alimentosTaco
      .filter((alimento) => {
        const nomeNormalizado = normalizarTexto(alimento.nome);
        return palavrasBusca.every((palavra) =>
          nomeNormalizado.includes(palavra),
        );
      })
      .slice(0, 15);

    if (resultadosLocais.length > 0) {
      setResultadosBusca(resultadosLocais);
      return;
    }

    // 2. Fallback: busca na API
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      termoLimpo,
    )}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,nutriments`;

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
        .map((produto, index) => ({
          id: produto.code || `api-${index}`,
          nome: produto.product_name,
          calorias100g: Math.round(produto.nutriments["energy-kcal_100g"]),
        }));

      if (resultadosApi.length === 0) {
        setErroBusca("Nenhum alimento com calorias foi encontrado.");
      }

      setResultadosBusca(resultadosApi);
    } catch (erro) {
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
      categoria: categoriaSelecionada || "cafe_da_manha",
    });
  };

  return (
    <div
      onClick={onClose}
      className="modal fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0F0F] text-[#F8F8F8] p-6 rounded-2xl w-full max-w-sm relative"
      >
        <button
          type="button"
          onClick={onClose}
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
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
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
                          calorias100g: produto.calorias100g,
                        });
                        setResultadosBusca([]);
                      }}
                      className="flex justify-between items-center p-2.5 bg-[#202020] hover:bg-[#337418] text-white rounded-lg text-left text-sm cursor-pointer transition-colors"
                    >
                      <span className="truncate pr-2 text-white">
                        {produto.nome || "Sem nome"}
                      </span>
                      <span className="text-[#5DD62C] font-semibold shrink-0">
                        {caloriasProporcionais} kcal ({quantidade || 0}g)
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {alimentoSelecionado && (
              <div className="bg-[#202020] p-3 rounded-xl border border-[#5DD62C]">
                <p className="font-semibold text-[#F8F8F8]">
                  {alimentoSelecionado.nome}
                </p>
                <span className="text-xs text-[#5DD62C]">
                  {caloriasEstimadas} kcal ({quantidade || 0}g) • base:{" "}
                  {alimentoSelecionado.calorias100g} kcal/100g
                </span>
              </div>
            )}

            <label className="text-sm text-gray-400">Quantidade (g)</label>
            <input
              type="number"
              value={quantidade}
              step={50}
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
              placeholder="Calorias"
              required
              className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
            />
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