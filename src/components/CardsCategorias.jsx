import { ChevronRight } from "lucide-react";
import {
  listaCategorias,
  nomesCategoria,
  iconesCategoria,
} from "../constants/categorias";

function CardsCategorias({ refeicoesDoDia, selectCard, setSelectCard }) {
  return (
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
              setSelectCard(selectCard === categoriaItem ? null : categoriaItem)
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
  );
}

export default CardsCategorias;
