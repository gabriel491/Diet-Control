import { useState } from "react";
import ListaVazia from "./components/ListaVazia";
import Header from "./components/Header";
import ModalRefeicao from "./components/ModalRefeicao";
import SeletorData from "./components/SeletorData";
import CardsCategorias from "./components/CardsCategorias";
import ResumoDiario from "./components/ResumoDiario";
import ModalMeta from "./components/ModalMeta";
import { coresCategoria, nomesCategoria } from "./constants/categorias";

function App() {
  // --- ESTADOS DA INTERFACE ---
  const [modal, setModal] = useState(false);
  const [modalMeta, setModalMeta] = useState(false);
  const [selectCard, setSelectCard] = useState(null);

  // --- ESTADOS DE DADOS ---
  const [refeicoes, setRefeicoes] = useState(
    JSON.parse(localStorage.getItem("refeicoes")) || [],
  );
  const [metaCalorias, setMetaCalorias] = useState(() => {
    const metaSalva = localStorage.getItem("metaCalorias");
    return metaSalva ? Number(metaSalva) : null;
  });

  const dataHoje = new Date().toLocaleDateString("en-CA");
  const [dataSelecionada, setDataSelecionada] = useState(dataHoje);

  // --- LÓGICA DE FILTRAGEM ---
  const refeicoesDoDia = refeicoes.filter(
    (refeicao) => refeicao.data === dataSelecionada,
  );

  const refeicoesSelecionadas = refeicoesDoDia.filter(
    (refeicao) => refeicao.categoria === selectCard,
  );

  const totalCalorias = refeicoesDoDia.reduce((acumulador, refeicao) => {
    return acumulador + Number(refeicao.calorias || 0);
  }, 0);

  // Soma segura dos macronutrientes do dia
  const macrosDoDia = refeicoesDoDia.reduce(
    (acc, refeicao) => ({
      proteinas: acc.proteinas + Number(refeicao.proteinas || 0),
      carboidratos: acc.carboidratos + Number(refeicao.carboidratos || 0),
      gorduras: acc.gorduras + Number(refeicao.gorduras || 0),
      fibras: acc.fibras + Number(refeicao.fibras || 0),
    }),
    { proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0 },
  );

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
  const salvarMeta = (novaMeta) => {
    setMetaCalorias(novaMeta);
    localStorage.setItem("metaCalorias", String(novaMeta));
    setModalMeta(false);
  };

  const deletarRefeicao = (id) => {
    const listaAtualizada = refeicoes.filter((refeicao) => refeicao.id !== id);
    setRefeicoes(listaAtualizada);
    localStorage.setItem("refeicoes", JSON.stringify(listaAtualizada));
  };

  return (
    <>
      {/* --- TELA PRINCIPAL --- */}
      <div className="bg-[#0F0F0F] min-h-screen px-3 py-4 sm:p-5 text-[#F8F8F8]">
        <div className="max-w-lg mx-auto">
          <Header />

          {/* Calendário */}
          <SeletorData
            dataSelecionada={dataSelecionada}
            dataHoje={dataHoje}
            setDataSelecionada={setDataSelecionada}
          />

          <ResumoDiario
            totalCalorias={totalCalorias}
            metaCalorias={metaCalorias}
            macros={macrosDoDia}
            onAbrirModalMeta={() => setModalMeta(true)}
          />

          <main className="p-3 sm:p-4 bg-[#0F0F0F] border border-[#202020] rounded-2xl">
            {/* Cards de Refeições */}

            <CardsCategorias
              refeicoesDoDia={refeicoesDoDia}
              selectCard={selectCard}
              setSelectCard={setSelectCard}
            />

            {selectCard !== null && (
              <button
                type="button"
                onClick={() => setModal(true)}
                className="bg-[#5DD62C] text-[#0F0F0F] font-bold py-2.5 px-4 rounded-xl hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors w-full cursor-pointer mb-4"
              >
                + Adicionar em {nomesCategoria[selectCard]}
              </button>
            )}

            {/* Lista de Refeições */}
            <ListaVazia
              refeicoesDoDia={
                selectCard === null ? refeicoesDoDia : refeicoesSelecionadas
              }
              deletarRefeicao={deletarRefeicao}
              coresCategoria={coresCategoria}
              nomesCategoria={nomesCategoria}
            />
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
      {modalMeta && (
        <ModalMeta
          metaAtual={metaCalorias}
          onClose={() => setModalMeta(false)}
          onSalvarMeta={salvarMeta}
        />
      )}
    </>
  );
}

export default App;
