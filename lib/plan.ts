import { addMonths, uid } from "./utils";
import type { Wedding, Task, BudgetCat, EnxovalItem, Gift, Moment, Table } from "./types";

export const PHASES = ["12+ meses antes", "9 a 12 meses", "6 a 9 meses", "3 a 6 meses", "1 a 3 meses", "Último mês", "Semana do casamento"];
const PHASE_MONTHS = [-13, -10.5, -7.5, -4.5, -2, -0.5, 0];
const T: [number, string][] = [
  [0, "Definir o orçamento total e quem paga o quê"], [0, "Fazer a lista A e a lista B de convidados"], [0, "Escolher a data e o estilo da celebração"],
  [0, "Visitar e reservar o espaço da festa"], [0, "Definir o local e o tipo de cerimônia"], [0, "Contratar assessoria ou cerimonialista"],
  [1, "Fechar o buffet"], [1, "Escolher a fotografia e o vídeo"], [1, "Contratar a música: banda, DJ ou cerimonial"], [1, "Reservar a lua de mel"],
  [1, "Dar entrada na documentação do cartório ou da igreja"], [1, "Escolher os padrinhos e madrinhas"], [1, "Contratar a decoração e as flores"],
  [2, "Definir o cardápio do buffet"], [2, "Escolher o vestido e o traje do noivo"], [2, "Contratar o celebrante"], [2, "Montar e publicar a lista de presentes"],
  [2, "Enviar os convites digitais"], [2, "Contratar bolo e doces"], [2, "Contratar transporte e hospedagem dos convidados"],
  [3, "Degustação do bolo e dos doces"], [3, "Prova dos trajes"], [3, "Definir alianças e comprar"], [3, "Contratar o penteado e a maquiagem"],
  [3, "Fazer o teste de penteado e maquiagem"], [3, "Escolher lembrancinhas"], [3, "Definir o roteiro da cerimônia e dos votos"],
  [4, "Confirmar presença de todos os convidados"], [4, "Montar o mapa de mesas"], [4, "Definir a playlist e as músicas de entrada"],
  [4, "Segunda prova dos trajes"], [4, "Confirmar horários com todos os fornecedores"], [4, "Preparar documentos e certidões finais"],
  [4, "Contratar segurança e estacionamento, se precisar"], [4, "Planejar o ensaio da cerimônia"],
  [5, "Passar a contagem final de convidados ao buffet"], [5, "Pagar as parcelas finais dos fornecedores"], [5, "Imprimir mapa de mesas e cronograma"],
  [5, "Preparar a mala da lua de mel e os documentos"], [5, "Entregar o cronograma a todos os fornecedores"], [5, "Alinhar o cortejo com os padrinhos"],
  [6, "Retirar trajes, alianças e lembrancinhas"], [6, "Fazer o ensaio geral"], [6, "Separar envelopes de gorjeta e pagamentos"],
  [6, "Descansar e cuidar de vocês"], [6, "Deixar uma pessoa de confiança como contato do dia"],
];
export function buildTasks(w: Wedding): Task[] {
  return T.map(([phase, title]) => ({ id: uid(), title, phase, done: false, owner: "Os dois", due: addMonths(w.date, Math.round(PHASE_MONTHS[phase])) }));
}
export function buildBudget(w: Wedding): BudgetCat[] {
  const split: [string, number][] = [["Espaço da festa", 12], ["Buffet e bebidas", 38], ["Decoração e flores", 10], ["Fotografia e vídeo", 8], ["Música", 6], ["Trajes e beleza", 7], ["Cerimônia", 3], ["Bolo e doces", 3], ["Convites e papelaria", 2], ["Lua de mel", 0], ["Imprevistos", 5], ["Outros", 6]];
  return split.map(([name, p]) => ({ id: uid(), name, planned: Math.round((w.budget * p) / 100) }));
}
export const VENDOR_CATS = ["Espaço da festa", "Buffet e bebidas", "Decoração e flores", "Fotografia e vídeo", "Música", "Trajes e beleza", "Cerimônia", "Bolo e doces", "Convites e papelaria", "Transporte", "Assessoria", "Outros"];


const CATALOG: [string, [string, number, boolean][]][] = [
  ["Cozinha", [["Jogo de panelas", 1, true], ["Frigideiras", 2, true], ["Pratos rasos", 6, true], ["Pratos fundos", 6, true], ["Copos", 8, true], ["Taças de vinho", 6, false], ["Talheres (jogo)", 1, true], ["Facas de cozinha", 3, true], ["Tábua de corte", 2, true], ["Potes herméticos", 8, true], ["Escorredor de louça", 1, true], ["Pano de prato", 6, true], ["Liquidificador", 1, true], ["Air fryer", 1, false], ["Cafeteira", 1, false], ["Batedeira", 1, false], ["Jogo de xícaras", 1, false], ["Sanduicheira", 1, false]]],
  ["Quarto", [["Jogo de cama casal", 3, true], ["Travesseiros", 2, true], ["Edredom", 2, true], ["Cobertor", 2, true], ["Protetor de colchão", 1, true], ["Cortinas blackout", 1, true], ["Cabides", 40, true], ["Mantas decorativas", 2, false], ["Abajur", 2, false]]],
  ["Banheiro", [["Toalhas de banho", 6, true], ["Toalhas de rosto", 6, true], ["Tapete de banheiro", 2, true], ["Cesto de roupa suja", 1, true], ["Kit de acessórios", 1, true], ["Lixeira", 2, true], ["Roupão", 2, false]]],
  ["Sala", [["Almofadas", 4, false], ["Manta de sofá", 2, false], ["Tapete", 1, true], ["Mesa de centro", 1, false], ["Luminária de chão", 1, false], ["Porta-retratos", 4, false]]],
  ["Lavanderia", [["Varal de chão", 1, true], ["Tábua de passar", 1, true], ["Ferro de passar", 1, true], ["Cesto organizador", 2, true], ["Balde e vassoura", 1, true], ["Mop", 1, true]]],
  ["Eletro e casa", [["Aspirador de pó", 1, false], ["Ventilador", 1, false], ["Micro-ondas", 1, true], ["Smart TV", 1, false], ["Cafeteira elétrica", 1, false]]],
  ["Mesa e receber", [["Jogo americano", 6, true], ["Toalha de mesa", 2, true], ["Travessas", 4, true], ["Jarra de suco", 1, true], ["Tábua de frios", 1, false], ["Jogo de sobremesa", 1, false]]],
];
export function buildEnxoval(w: Wedding): EnxovalItem[] {
  const out: EnxovalItem[] = [];
  for (const [room, items] of CATALOG) for (const [name, qty, ess] of items) {
    out.push({ id: uid(), room, name, qty, essential: ess, state: "novo" });
  }
  return out;
}
export const PRICES: Record<string, number> = { "Jogo de panelas": 450, "Air fryer": 380, "Liquidificador": 180, "Micro-ondas": 650, "Smart TV": 1900, "Aspirador de pó": 480, "Jogo de cama casal": 220, "Edredom": 260, "Toalhas de banho": 70, "Aparelho de jantar": 380 };
export function buildGifts(w: Wedding, items: EnxovalItem[]): Gift[] {
  const g: Gift[] = items.filter((i) => i.essential && i.qty <= 6 && ["Cozinha", "Quarto", "Eletro e casa", "Banheiro"].includes(i.room)).slice(0, 14).map((i) => ({ id: uid(), title: i.name, category: i.room, price: PRICES[i.name] ?? 120, url: "", qty: i.qty > 3 ? 1 : i.qty, got: 0, reservedBy: [], kind: "casa" as const }));
  if (w.honeymoon) ["Jantar romântico na lua de mel", "Passeio de barco", "Noite de hotel", "Passagem aérea (cota)", "Spa a dois"].forEach((t, i) => g.push({ id: uid(), title: t, category: "Lua de mel", price: [320, 280, 450, 600, 350][i], url: "", qty: 1, got: 0, reservedBy: [], kind: "lua-de-mel" }));
  g.push({ id: uid(), title: "Cota livre para a casa nova", category: "Cota", price: 100, url: "", qty: 20, got: 0, reservedBy: [], kind: "cota" });
  return g;
}
export function buildMoments(w: Wedding): Moment[] {
  const [h, m] = w.time.split(":").map(Number); const at = (off: number) => { const t = h * 60 + m + off; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
  return [[-480, "Café da manhã e início do making of", "Noivos"], [-300, "Chegada dos fotógrafos e do cabelo e maquiagem", "Fotografia"], [-120, "Decoração finalizada e som testado", "Decoração, DJ"], [-60, "Chegada do buffet e equipe", "Buffet"], [-30, "Recepção dos primeiros convidados", "Cerimonial"], [0, "Entrada e cerimônia", "Todos"], [60, "Cumprimentos e fotos", "Fotografia"], [90, "Entrada do casal na recepção", "DJ"], [120, "Jantar servido", "Buffet"], [200, "Valsa e abertura da pista", "DJ"], [260, "Corte do bolo", "Bolo"], [420, "Encerramento", "Cerimonial"]].map(([o, title, who]) => ({ id: uid(), time: at(o as number), title: title as string, who: who as string }));
}
export function buildTables(w: Wedding): Table[] {
  const n = Math.max(4, Math.ceil(w.guestsEstimate / 8)); const t: Table[] = [{ id: uid(), name: "Mesa do casal", seats: 4, x: 300, y: 40, kind: "casal" }, { id: uid(), name: "Pista de dança", seats: 0, x: 280, y: 180, kind: "pista" }];
  for (let i = 0; i < Math.min(n, 18); i++) t.push({ id: uid(), name: `Mesa ${i + 1}`, seats: 8, x: 40 + (i % 5) * 140, y: 330 + Math.floor(i / 5) * 130, kind: "mesa" });
  return t;
}
export const PALETTES = [["#3f5b4b", "#f4ead6", "#c2603f"], ["#7a3b52", "#f6e6ea", "#b8924a"], ["#2f4a6b", "#e8eef5", "#c9a56a"], ["#22201e", "#f1ece3", "#b8924a"], ["#8a6b4f", "#f3ece2", "#3f5b4b"]];
export const STYLES = [{ id: "classico", name: "Clássico", font: "var(--font-serif)" }, { id: "jardim", name: "Jardim", font: "var(--font-serif)" }, { id: "praia", name: "Praia", font: "var(--font-inter)" }, { id: "gala", name: "Gala", font: "var(--font-serif)" }, { id: "civil", name: "Civil", font: "var(--font-inter)" }] as const;
