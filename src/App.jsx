import { Salad, Trash2 } from "lucide-react";
import "./App.css";
import { useState } from "react";

function App() {
  const adicionarRefeicao = (e) => {
    e.preventDefault();

    const novaRefeicao = {
      id: Date.now(),
      nome: name,
      peso,
      categoria,
      calorias,
    };
    const listaRefeicoes = [...refeicoes, novaRefeicao];
    setRefeicoes(listaRefeicoes);

    localStorage.setItem("refeicoes", JSON.stringify(listaRefeicoes));

    // Limpando todos os campos do formulário
    setName("");
    setPeso("");
    setCalorias("");
  };

  const deletarRefeicao = (id) => {
    // Filtra a lista
    const listaAtualizada = refeicoes.filter((refeicao) => refeicao.id != id);

    // Atualiza a memória do React
    setRefeicoes(listaAtualizada);

    // Salva a nova lista no navegador, substituindo a antiga
    localStorage.setItem("refeicoes", JSON.stringify(listaAtualizada));
  };

  const [name, setName] = useState("");
  const [peso, setPeso] = useState("");
  const [categoria, setCategoria] = useState("cafe_da_manha");
  const [calorias, setCalorias] = useState("");

  // Busca as refeições na memória local
  const [refeicoes, setRefeicoes] = useState(
    JSON.parse(localStorage.getItem("refeicoes")) || []
  );

  const coresCategoria = {
    cafe_da_manha: "border border-[#5DD62C] text-[#5DD62C]",
    almoco: "border border-[#5DD62C] text-[#F8F8F8]",
    lanche: "bg-[#337418] text-[#F8F8F8]",
    janta: "bg-[#202020] text-[#5DD62C] border border-[#337418]",
  };

  // Dicionário extra apenas para formatar o texto na tela
  const nomesCategoria = {
    cafe_da_manha: "Café da Manhã",
    almoco: "Almoço",
    lanche: "Lanche",
    janta: "Jantar",
  };

  // CORREÇÃO: "refeicao.calorias" no singular
  const totalCalorias = refeicoes.reduce((acumulador, refeicao) => {
    return acumulador + Number(refeicao.calorias || 0);
  }, 0);

  return (
    <>
      {/* Fundo principal e cor do texto padrão */}
      <div className="bg-[#0F0F0F] min-h-screen p-5 text-[#F8F8F8]">
        <div className="max-w-lg mx-auto">
          {/* Header com fundo escuro médio */}
          <header className="bg-[#202020] p-4 shadow-md rounded-t-lg border-b border-[#337418]">
            <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              Meu Diário de Alimentação <Salad className="text-[#5DD62C]" />
            </h1>
            
            {/* CORREÇÃO DA EXIBIÇÃO: Estilizado com as cores do seu tema */}
            <p className="text-center mt-2 text-gray-400 font-medium">
              Calorias Consumidas: <span className="text-[#5DD62C] text-xl font-bold">{totalCalorias} kcal</span>
            </p>
          </header>

          <main className="p-4 bg-[#0F0F0F] border-x border-b border-[#202020] rounded-b-lg">
            <form
              onSubmit={adicionarRefeicao}
              className="flex flex-col gap-3 mb-6"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do alimento"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
              />
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Peso em Gramas"
                className="p-2 bg-[#202020] text-[#F8F8F8] border border-[#202020] focus:border-[#5DD62C] outline-none rounded placeholder-gray-500"
              />

              <input
                type="number"
                value={calorias}
                onChange={(e) => setCalorias(e.target.value)}
                placeholder="Calorias"
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
                Registrar
              </button>
            </form>

            {refeicoes.map((refeicao) => (
              <div
                className="flex items-center justify-between bg-[#202020] p-4 rounded-lg shadow-md mb-2 border border-transparent hover:border-[#337418] transition-colors"
                key={refeicao.id}
              >
                <div className="flex items-center gap-3">
                  {/* Formatação do texto arrumada */}
                  <span className="font-medium text-[#F8F8F8]">
                    {refeicao.nome} - {refeicao.peso}g - {refeicao.calorias} kcal
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      coresCategoria[refeicao.categoria] ||
                      "border border-gray-500 text-gray-400"
                    }`}
                  >
                    {nomesCategoria[refeicao.categoria] || "Outros"}
                  </span>
                </div>

                <button
                  className="text-gray-400 hover:text-[#5DD62C] transition-colors duration-300"
                  onClick={() => {
                    deletarRefeicao(refeicao.id);
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
}

export default App;