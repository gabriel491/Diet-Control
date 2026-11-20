import { useState } from "react";
import ListaVazia from "./components/ListaVazia";
import Header from "./components/Header";
import ModalRefeicao from "./components/ModalRefeicao";
import SeletorData from "./components/SeletorData";
import CardsCategorias from "./components/CardsCategorias";
import { coresCategoria, nomesCategoria } from "./constants/categorias";

function App() {
  // --- ESTADOS DA INTERFACE ---
  const [modal, setModal] = useState(false);
  const [selectCard, setSelectCard] = useState(null);

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

  // --- FUNÇÕES DE AÇÃO ---
  const registrarRefeicao = (dadosRefeicao) => {
    const novaRefeicao = {
      id: Date.now(),
      data: dataSelecionada,
      ...dadosRefeicao,
    };

    const listaRefeicoes = [...refeicoes, novaRefeicao];
    setRefeicoes(listaRefeicoes);
    localStorage.setItem("refeicoes", JSON.stringify(listaRefeicoes));
    setModal(false);
  };

  const deletarRefeicao = (id) => {
    const listaAtualizada = refeicoes.filter((refeicao) => refeicao.id != id);
    setRefeicoes(listaAtualizada);
    localStorage.setItem("refeicoes", JSON.stringify(listaAtualizada));
  };

  return (
    <>
      {/* --- TELA PRINCIPAL --- */}
      <div className="bg-[#0F0F0F] min-h-screen p-5 text-[#F8F8F8]">
        <div className="max-w-lg mx-auto">
          <Header totalCalorias={totalCalorias} />

          {/* Calendário */}
          <SeletorData
            dataSelecionada={dataSelecionada}
            dataHoje={dataHoje}
            setDataSelecionada={setDataSelecionada}
          />

          <main className="p-4 bg-[#0F0F0F] border-x border-b border-[#202020] rounded-b-lg">
            {/* Cards de Refeições */}

            <CardsCategorias
              refeicoesDoDia={refeicoesDoDia}
              selectCard={selectCard}
              setSelectCard={setSelectCard}
            />

            {/* Lista e Botão */}
            <ListaVazia
              refeicoesDoDia={
                selectCard === null ? refeicoesDoDia : refeicoesSelecionadas
              }
              deletarRefeicao={deletarRefeicao}
              coresCategoria={coresCategoria}
              nomesCategoria={nomesCategoria}
            />
            {selectCard !== null && (
              <button
                onClick={() => setModal(true)}
                className="bg-[#5DD62C] text-[#0F0F0F] font-bold p-2 rounded hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors mt-4 w-full cursor-pointer"
              >
                + Adicionar Refeição
              </button>
            )}
          </main>
        </div>
      </div>

      {/* --- MODAL FLUTUANTE --- */}
      {modal && (
        <ModalRefeicao
          onClose={() => setModal(false)}
          onSalvarRefeicao={registrarRefeicao}
          categoriaSelecionada={selectCard}
        />
      )}
    </>
  );
}

export default App;
