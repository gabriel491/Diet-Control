import { useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";

function SeletorData({ dataSelecionada, setDataSelecionada, dataHoje }) {
  const inputDataRef = useRef(null);

  const formatarData = (data) => {
    const dataObj = new Date(data + "T12:00:00");
    const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return data === dataHoje ? "Hoje, " + dataFormatada : dataFormatada;
  };

  return (
    <div className="flex items-center justify-center mt-4 mb-6">
      <label
        onClick={() => inputDataRef.current.showPicker()}
        className="relative flex items-center justify-center gap-2 py-2 px-4 bg-[#202020] text-[#F8F8F8] rounded-full cursor-pointer hover:bg-[#337418] transition-colors shadow-md"
      >
        <Calendar size={20} />
        <span className="font-medium">{formatarData(dataSelecionada)}</span>
        <ChevronDown size={20} />
        <input
          style={{ colorScheme: "dark" }}
          ref={inputDataRef}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
        />
      </label>{" "}
    </div>
  );
}

export default SeletorData;
