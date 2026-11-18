import { Calendar, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import ListaVazia from "./components/ListaVazia";
import Header from "./components/Header";

function App() {
  // --- FUNÇÕES DE AÇÃO ---
  const adicionarRefeicao = (e) => {
    e.preventDefault();

    const novaRefeicao = {
      id: Date.now(),
      nome: name,
      peso,
      categoria,
      calorias,
      data: dataSelecionada,
    };
    const listaRefeicoes = [...refeicoes, novaRefeicao];
    setRefeicoes(listaRefeicoes);
    localStorage.setItem("refeicoes", JSON.stringify(listaRefeicoes));

    // Limpando todos os campos do formulário e fechando o modal
    setName("");
    setPeso("");
    setCalorias("");
    setModal(false);
  };

  const deletarRefeicao = (id) => {
    const listaAtualizada = refeicoes.filter((refeicao) => refeicao.id != id);
    setRefeicoes(listaAtualizada);
    localStorage.setItem("refeicoes", JSON.stringify(listaAtualizada));
  };

  // --- ESTADOS DO FORMULÁRIO ---
  const [name, setName] = useState("");
  const [peso, setPeso] = useState("");
  const [categoria, setCategoria] = useState("cafe_da_manha");
  const [calorias, setCalorias] = useState("");

  // --- ESTADOS DA INTERFACE ---
  const [modal, setModal] = useState(false);
  const [selectCard, setSelectCard] = useState(null);
  const inputDataRef = useRef(null);

  // --- ESTADOS DE DADOS ---
  const [refeicoes, setRefeicoes] = useState(
    JSON.parse(localStorage.getItem("refeicoes")) || []
  );

  const dataHoje = new Date().toISOString().split("T")[0];
  const [dataSelecionada, setDataSelecionada] = useState(dataHoje);

  // --- LÓGICA DE FILTRAGEM ---
  const refeicoesDoDia = refeicoes.filter(
    (refeicao) => refeicao.data == dataSelecionada
  );

  const refeicoesSelecionadas = refeicoesDoDia.filter(
    (refeicao) => refeicao.categoria === selectCard
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

  // --- FUNÇÕES AUXILIARES ---
  const formatarData = (dataSelecionada) => {
    const dataObj = new Date(dataSelecionada + "T12:00:00");
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return dataSelecionada === dataHoje ? "Hoje, " + dataFormatada : dataFormatada;
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
            <div className="flex gap-4 mb-6">
              {listaCategorias.map((categoriaItem) => (
                <div
                  key={categoriaItem}
                  onClick={() => setSelectCard(categoriaItem)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all bg-[#202020] text-[#5DD62C] ${selectCard === categoriaItem ? "border-[#337418]" : "border-transparent"}`}
                >
                  {nomesCategoria[categoriaItem]}
                </div>
              ))}
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
                  className="bg-[#5DD62C] text-[#0F0F0F] font-bold p-2 rounded hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors mt-4 w-full"
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
        <div className="modal fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0F0F0F] p-6 rounded-2xl w-full max-w-sm relative">
            <button
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold"
            >
              X
            </button>

            <h2 className="text-xl font-bold mb-4 text-[#F8F8F8]">Registrar Alimento</h2>

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

              <button className="bg-[#5DD62C] text-[#0F0F0F] font-bold p-2 rounded hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors mt-2">
                Salvar Refeição
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;