import {
  Flame,
  BicepsFlexed,
  Wheat,
  Droplet,
  Leaf,
  Pencil,
} from "lucide-react";

function ResumoDiario({
  totalCalorias,
  metaCalorias,
  macros,
  onAbrirModalMeta,
}) {
  const temMeta = Boolean(metaCalorias && metaCalorias > 0);
  const porcentagemReal = temMeta
    ? Math.round((totalCalorias / metaCalorias) * 100)
    : 0;
  const porcentagemVisual = Math.min(porcentagemReal, 100);
  const caloriasRestantes = temMeta ? metaCalorias - totalCalorias : 0;

  // Configuração do anel circular (SVG)
  const tamanho = 120;
  const espessura = 11;
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const strokeDashoffset =
    circunferencia - (porcentagemVisual / 100) * circunferencia;

  const calcularPorcentagemMacro = (kcalMacro) => {
    if (totalCalorias <= 0) return 0;
    return Math.round((kcalMacro / totalCalorias) * 100);
  };

  const listaMacros = [
    {
      id: "proteinas",
      nome: "Proteínas",
      valor: Math.round(macros.proteinas),
      porcentagem: calcularPorcentagemMacro(macros.proteinas * 4),
      icone: <BicepsFlexed size={22} className="text-sky-400" />,
    },
    {
      id: "carboidratos",
      nome: "Carboidratos",
      valor: Math.round(macros.carboidratos),
      porcentagem: calcularPorcentagemMacro(macros.carboidratos * 4),
      icone: <Wheat size={22} className="text-amber-400" />,
    },
    {
      id: "gorduras",
      nome: "Gorduras",
      valor: Math.round(macros.gorduras),
      porcentagem: calcularPorcentagemMacro(macros.gorduras * 9),
      icone: <Droplet size={22} className="text-purple-400" />,
    },
    {
      id: "fibras",
      nome: "Fibras",
      valor: Math.round(macros.fibras),
      porcentagem: calcularPorcentagemMacro(macros.fibras * 2),
      icone: <Leaf size={22} className="text-[#5DD62C]" />,
    },
  ];

  return (
    <section className="flex flex-col gap-4 mb-6">
      {/* Card de Calorias e Meta Diária */}
      <div className="bg-[#161616] border border-[#262626] rounded-2xl p-5 flex items-center gap-5">
        {/* Anel de Progresso */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={tamanho}
            height={tamanho}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={tamanho / 2}
              cy={tamanho / 2}
              r={raio}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth={espessura}
            />
            {porcentagemVisual > 0 && (
              <circle
                cx={tamanho / 2}
                cy={tamanho / 2}
                r={raio}
                fill="none"
                stroke="#5DD62C"
                strokeWidth={espessura}
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            )}
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-[#F8F8F8] leading-none">
              {totalCalorias.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-gray-400 mt-1">kcal</span>
          </div>
        </div>

        {/* Divisor Vertical */}
        <div className="w-px h-24 bg-[#262626] shrink-0" />

        {/* Bloco da Meta */}
        <div className="flex-1 min-w-0">
          {!temMeta ? (
            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={onAbrirModalMeta}
                className="text-left text-base font-bold text-[#5DD62C] hover:underline cursor-pointer"
              >
                Definir Meta Diária
              </button>
              <p className="text-xs text-gray-400 leading-relaxed">
                Configure sua meta de calorias para acompanhar seu progresso
                diário.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onAbrirModalMeta}
                className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#F8F8F8] transition-colors cursor-pointer w-fit"
                title="Alterar meta diária"
              >
                <span>Meta diária</span>
                <Pencil
                  size={12}
                  className="opacity-60 group-hover:opacity-100"
                />
              </button>

              <p className="text-xl font-bold text-[#F8F8F8] leading-none">
                {metaCalorias.toLocaleString("pt-BR")} kcal
              </p>

              {/* Barra Horizontal + Porcentagem */}
              <div className="flex items-center gap-2.5 mt-1">
                <div className="flex-1 h-2.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5DD62C] rounded-full transition-all duration-500"
                    style={{ width: `${porcentagemVisual}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-[#5DD62C] shrink-0">
                  {porcentagemReal}%
                </span>
              </div>

              {/* Calorias Restantes */}
              <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-0.5">
                <Flame
                  size={15}
                  className={
                    caloriasRestantes >= 0
                      ? "text-amber-400 shrink-0"
                      : "text-red-400 shrink-0"
                  }
                />
                <span>
                  {caloriasRestantes >= 0
                    ? `${caloriasRestantes.toLocaleString("pt-BR")} kcal restantes`
                    : `${Math.abs(caloriasRestantes).toLocaleString("pt-BR")} kcal acima da meta`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card de Macronutrientes (sem barra de progresso) */}
      <div className="bg-[#161616] border border-[#262626] rounded-2xl py-4 px-2 grid grid-cols-4 divide-x divide-[#262626]">
        {listaMacros.map((macro) => (
          <div
            key={macro.id}
            className="flex flex-col items-center text-center px-1.5 gap-1"
          >
            {macro.icone}
            <span className="text-[11px] sm:text-xs text-gray-400 mt-1 truncate max-w-full">
              {macro.nome}
            </span>
            <span className="text-sm sm:text-base font-bold text-[#F8F8F8]">
              {macro.valor} g
            </span>
            <span className="text-[11px] text-gray-400">
              ≈ {macro.porcentagem}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ResumoDiario;