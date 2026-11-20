import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Coffee,
  Utensils,
  Apple,
  ConciergeBell,
  Search,
  Flame,
} from "lucide-react";
import alimentosTaco from "./data/taco.json";
import { useState, useRef } from "react";
import ListaVazia from "./components/ListaVazia";
import Header from "./components/Header";

function App() {
  // --- ESTADOS DO FORMULÁRIO ---
  const [name, setName] = useState("");
  const [peso, setPeso] = useState("");
  const [categoria, setCategoria] = useState("cafe_da_manha");
  const [calorias, setCalorias] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [alimentoSelecionado, setAlimentoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(100);

  const caloriasEstimadas = alimentoSelecionado
    ? Math.round((alimentoSelecionado.calorias100g * quantidade) / 100)
    : 0;

  // --- ESTADOS DA INTERFACE ---
  const [modal, setModal] = useState(false);
  const [selectCard, setSelectCard] = useState(null);
  const inputDataRef = useRef(null);
  const [abaAtiva, setAbaAtiva] = useState("busca");

  // --- ESTADOS DA API ---
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  // --- ESTADOS DE DADOS ---
  const [refeicoes, setRefeicoes] = useState(
    JSON.parse(localStorage.getItem("refeicoes")) || [],
  );

  const dataHoje = new Date().toISOString().split("T")[0];
  const [dataSelecionada, setDataSelecionada] = useState(dataHoje);

  // --- LÓGICA DE FILTRAGEM ---
  const refeicoesDoDia = refeicoes.filter(
    (refeicao) => refeicao.data == dataSelecionada,
  );

  const refeicoesSelecionadas = refeicoesDoDia.filter(
    (refeicao) => refeicao.categoria === selectCard,
  );

  const totalCalorias = refeicoesDoDia.reduce((acumulador, refeicao) => {
    return acumulador + Number(refeicao.calorias || 0);
  }, 0);

  // --- DICIONÁRIOS E LISTAS ---
  const coresCategoria = {
    cafe_da_manha: "border border-[#5DD62C] text-[#5DD62C]",
    almoco: "border border-[#5DD62C] text-[#F8F8F8]",
    lanche: "bg-[#337418] text-[#F8F8F8]",
    janta: "bg-[#202020] text-[#5DD62C] border border-[#337418]",
  };

  const nomesCategoria = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    lanche: "Lanche",
    janta: "Jantar",
  };

  const listaCategorias = ["cafe_da_manha", "almoco", "lanche", "janta"];

  const iconesCategoria = {
    cafe_da_manha: <Coffee className="text-[#5DD62C]" size={20} />,
    almoco: <Utensils className="text-[#5DD62C]" size={20} />,
    lanche: <Apple className="text-[#5DD62C]" size={20} />,
    janta: <ConciergeBell className="text-[#5DD62C]" size={20} />,
  };

  const opcoesPeso = [50, 100, 150, 200];

  // --- FUNÇÕES DE AÇÃO ---
  const fecharModal = () => {
    setModal(false);
    setTermoBusca("");
    setResultadosBusca([]);
    setErroBusca("");
    setAlimentoSelecionado(null);
    setQuantidade(100);
  };

  const adicionarRefeicao = (e) => {
    e.preventDefault();

    const novaRefeicao = {
      id: Date.now(),
      nome: name,
      peso,
      categoria: selectCard || categoria,
      calorias,
      data: dataSelecionada,
    };

    const listaRefeicoes = [...refeicoes, novaRefeicao];
    setRefeicoes(listaRefeicoes);
    localStorage.setItem("refeicoes", JSON.stringify(listaRefeicoes));

    setName("");
    setPeso("");
    setCalorias("");
    fecharModal();
  };

  const deletarRefeicao = (id) => {
    const listaAtualizada = refeicoes.filter((refeicao) => refeicao.id != id);
    setRefeicoes(listaAtualizada);
    localStorage.setItem("refeicoes", JSON.stringify(listaAtualizada));
  };

  const salvarAlimentoBuscado = () => {
    if (alimentoSelecionado === null) {
      return;
    }

    const novaRefeicao = {
      id: Date.now(),
      nome: alimentoSelecionado.nome,
      peso: quantidade,
      calorias: caloriasEstimadas,
      data: dataSelecionada,
      categoria: selectCard || categoria,
    };

    const listaRefeicoes = [...refeicoes, novaRefeicao];
    setRefeicoes(listaRefeicoes);
    localStorage.setItem("refeicoes", JSON.stringify(listaRefeicoes));

    fecharModal();
  };

  // --- FUNÇÕES AUXILIARES ---
  const formatarData = (dataSelecionada) => {
    const dataObj = new Date(dataSelecionada + "T12:00:00");
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return dataSelecionada === dataHoje
      ? "Hoje, " + dataFormatada
      : dataFormatada;
  };
  const normalizarTexto = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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

    // Fallback: se não encontrou localmente, busca na API
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

  return (
    <>
      {/* --- TELA PRINCIPAL --- */}
      <div className="bg-[#0F0F0F] min-h-screen p-5 text-[#F8F8F8]">
        <div className="max-w-lg mx-auto">
          <Header totalCalorias={totalCalorias} />

          {/* Calendário */}
          <div className="flex items-center justify-center mt-4 mb-6">
            <label
              onClick={() => inputDataRef.current.showPicker()}
              className="relative flex items-center justify-center gap-2 py-2 px-4 bg-[#202020] text-[#F8F8F8] rounded-full cursor-pointer hover:bg-[#337418] transition-colors shadow-md"
            >
              <Calendar size={20} />
              <span className="font-medium">
                {formatarData(dataSelecionada)}
              </span>
              <ChevronDown size={20} />
              <input
                style={{ colorScheme: "dark" }}
                ref={inputDataRef}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />
            </label>
          </div>

          <main className="p-4 bg-[#0F0F0F] border-x border-b border-[#202020] rounded-b-lg">
            {/* Cards de Refeições com .map() */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {listaCategorias.map((categoriaItem) => {
                const refeicoesDaCategoria = refeicoesDoDia.filter(
                  (refeicao) => refeicao.categoria === categoriaItem,
                );
                const caloriasDaCategoria = refeicoesDaCategoria.reduce(
                  (acumulador, refeicao) => {
                    return acumulador + Number(refeicao.calorias || 0);
                  },
                  0,
                );

                return (
                  <div
                    key={categoriaItem}
                    onClick={() =>
                      setSelectCard(
                        selectCard === categoriaItem ? null : categoriaItem,
                      )
                    }
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all bg-[#202020] ${
                      selectCard === categoriaItem
                        ? "border-[#5DD62C]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      {iconesCategoria[categoriaItem]}
                      <span className="font-semibold text-[#F8F8F8] mt-1">
                        {nomesCategoria[categoriaItem]}
                      </span>
                      <span className="text-sm text-[#F8F8F8]">
                        {refeicoesDaCategoria.length > 0
                          ? `${caloriasDaCategoria} kcal`
                          : "-"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {refeicoesDaCategoria.length > 0
                          ? refeicoesDaCategoria.length === 1
                            ? "1 item"
                            : `${refeicoesDaCategoria.length} itens`
                          : "Sem registros"}
                      </span>
                    </div>

                    <ChevronRight
                      size={20}
                      className={`text-gray-400 transition-transform ${
                        selectCard === categoriaItem ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Renderização Condicional da Lista e Botão */}
            {selectCard === null && (
              <ListaVazia
                refeicoesDoDia={refeicoesDoDia}
                deletarRefeicao={deletarRefeicao}
                coresCategoria={coresCategoria}
                nomesCategoria={nomesCategoria}
              />
            )}

            {selectCard !== null && (
              <>
                <ListaVazia
                  refeicoesDoDia={refeicoesSelecionadas}
                  deletarRefeicao={deletarRefeicao}
                  coresCategoria={coresCategoria}
                  nomesCategoria={nomesCategoria}
                />
                <button
                  onClick={() => setModal(true)}
                  className="bg-[#5DD62C] text-[#0F0F0F] font-bold p-2 rounded hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors mt-4 w-full cursor-pointer"
                >
                  + Adicionar Refeição
                </button>
              </>
            )}
          </main>
        </div>
      </div>

      {/* --- MODAL FLUTUANTE --- */}
      {modal === true && (
        <div
          onClick={fecharModal}
          className="modal fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F0F0F] text-[#F8F8F8] p-6 rounded-2xl w-full max-w-sm relative"
          >
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold cursor-pointer"
            >
              X
            </button>

            <h2 className="text-xl font-bold mb-4 text-[#F8F8F8]">
              Registrar Alimento
            </h2>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
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

                {carregando && (
                  <p className="text-sm text-gray-400">Buscando...</p>
                )}

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
                  onClick={salvarAlimentoBuscado}
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
              <form
                onSubmit={adicionarRefeicao}
                className="flex flex-col gap-3"
              >
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
      )}
    </>
  );
}

export default App;
