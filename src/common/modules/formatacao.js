export { dataBR, dataHoraBR, moeda, plural };

// Data: 23/09/2026
const dataBR = (iso) => new Date(iso).toLocaleDateString("pt-BR");

// Data + hora: 23/09/2026 10:30:00
const dataHoraBR = (iso) => new Date(iso).toLocaleString("pt-BR");

// Moeda: R$ 50,00
const moeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

// Singular/plural
const plural = (n, singular, pluralTxt) =>
  `${n} ${n === 1 ? singular : pluralTxt}`;
