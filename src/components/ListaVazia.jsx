import { Trash2, Utensils } from "lucide-react";

function ListaVazia({
  refeicoesDoDia,
  deletarRefeicao,
  coresCategoria,
  nomesCategoria,
}) {
  return refeicoesDoDia.length === 0 ? (
    <div className="group flex flex-col items-center justify-center gap-3 mt-10 text-gray-500">
      <Utensils
        size={48}
        className="animate-pulse text-gray-400 transition duration-300 group-hover:text-[#5DD62C] group-hover:scale-110"
      />
      <span className="font-medium">Nenhuma refeição registrada neste dia</span>
    </div>
  ) : (
    refeicoesDoDia.map((refeicao) => (
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
    ))
  );
}

export default ListaVazia;