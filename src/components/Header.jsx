import { Salad } from "lucide-react";

function Header({ totalCalorias }) {
  return (
    <header className="bg-[#202020] p-4 shadow-md rounded-t-lg border-b border-[#337418]">
      <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
        Meu Diário de Alimentação <Salad className="text-[#5DD62C]" />
      </h1>

      {/* CORREÇÃO DA EXIBIÇÃO: Estilizado com as cores do seu tema */}
      <p className="text-center mt-2 text-gray-400 font-medium">
        Calorias Consumidas:{" "}
        <span className="text-[#5DD62C] text-xl font-bold">
          {totalCalorias} kcal
        </span>
      </p>
    </header>
  );
}

export default Header;