import { Coffee, Utensils, Apple, ConciergeBell } from "lucide-react";

export const listaCategorias = ["cafe_da_manha", "almoco", "lanche", "janta"];

export const nomesCategoria = {
  cafe_da_manha: "Café da Manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  janta: "Jantar",
};

export const coresCategoria = {
  cafe_da_manha: "border border-[#5DD62C] text-[#5DD62C]",
  almoco: "border border-[#5DD62C] text-[#F8F8F8]",
  lanche: "bg-[#337418] text-[#F8F8F8]",
  janta: "bg-[#202020] text-[#5DD62C] border border-[#337418]",
};

export const iconesCategoria = {
  cafe_da_manha: <Coffee className="text-[#5DD62C]" size={20} />,
  almoco: <Utensils className="text-[#5DD62C]" size={20} />,
  lanche: <Apple className="text-[#5DD62C]" size={20} />,
  janta: <ConciergeBell className="text-[#5DD62C]" size={20} />,
};