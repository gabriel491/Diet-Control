import { useState } from "react";
import { Target } from "lucide-react";

function ModalMeta({ metaAtual, onClose, onSalvarMeta }) {
  const [valor, setValor] = useState(metaAtual ? String(metaAtual) : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const numero = Number(valor);
    if (!numero || numero <= 0) return;
    onSalvarMeta(numero);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0F0F] border border-[#262626] text-[#F8F8F8] p-6 rounded-2xl w-full max-w-sm relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold cursor-pointer"
        >
          X
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Target className="text-[#5DD62C]" size={22} />
          <h2 className="text-xl font-bold">
            {metaAtual ? "Editar Meta Diária" : "Definir Meta Diária"}
          </h2>
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Informe quantas calorias você pretende consumir por dia.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 1800"
              autoFocus
              required
              className="w-full p-3 pr-14 bg-[#202020] text-[#F8F8F8] rounded-xl border border-transparent focus:border-[#5DD62C] outline-none placeholder-gray-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              kcal
            </span>
          </div>

          <button
            type="submit"
            className="bg-[#5DD62C] text-[#0F0F0F] font-bold py-2.5 rounded-xl hover:bg-[#337418] hover:text-[#F8F8F8] transition-colors cursor-pointer"
          >
            Salvar Meta
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalMeta;