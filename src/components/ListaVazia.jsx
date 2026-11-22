import { Trash2, UtensilsCrossed } from "lucide-react";

const formatarMacro = (valor) => {
  const num = Number(valor || 0);
  return Number.isInteger(num) ? num : num.toFixed(1).replace(".", ",");
};

function ListaVazia({
  refeicoesDoDia,
  deletarRefeicao,
  coresCategoria,
  nomesCategoria,
}) {
  if (refeicoesDoDia.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-4 text-gray-500 gap-2">
        <UtensilsCrossed size={32} className="text-gray-600" />
        <p className="text-sm text-gray-400">
          Nenhuma refeição registrada neste dia
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {refeicoesDoDia.map((refeicao) => {
        const temMacros =
          refeicao.proteinas != null ||
          refeicao.carboidratos != null ||
          refeicao.gorduras != null ||
          refeicao.fibras != null;

        return (
          <li
            key={refeicao.id}
            className="bg-[#202020] border border-[#2B2B2B] rounded-xl p-3.5 flex flex-col gap-2.5"
          >
            {/* Topo: Nome do alimento + Lixeira */}
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-sm sm:text-base text-[#F8F8F8] leading-snug">
                {refeicao.nome}
              </p>

              <button
                type="button"
                onClick={() => deletarRefeicao(refeicao.id)}
                aria-label={`Excluir ${refeicao.nome}`}
                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer shrink-0 p-0.5"
              >
                <Trash2 size={17} />
              </button>
            </div>

            {/* Meio: Peso + Calorias à esquerda | Categoria à direita */}
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <span>{refeicao.peso}g</span>
                <span className="text-gray-600">•</span>
                <span className="text-[#5DD62C] font-semibold">
                  {refeicao.calorias} kcal
                </span>
              </div>

              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                  coresCategoria[refeicao.categoria] ||
                  "border-[#5DD62C] text-[#F8F8F8]"
                }`}
              >
                {nomesCategoria[refeicao.categoria] || refeicao.categoria}
              </span>
            </div>

            {/* Rodapé: Macronutrientes (só aparece em itens que possuem macros salvos) */}
            {temMacros && (
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#2E2E2E] text-[11px] sm:text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">P:</span>
                  <span className="text-sky-400 font-medium">
                    {formatarMacro(refeicao.proteinas)}g
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-500">C:</span>
                  <span className="text-amber-400 font-medium">
                    {formatarMacro(refeicao.carboidratos)}g
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-500">G:</span>
                  <span className="text-purple-400 font-medium">
                    {formatarMacro(refeicao.gorduras)}g
                  </span>
                </div>

                <div className="flex items-center gap-1 justify-end sm:justify-start">
                  <span className="text-gray-500">F:</span>
                  <span className="text-[#5DD62C] font-medium">
                    {formatarMacro(refeicao.fibras)}g
                  </span>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default ListaVazia;