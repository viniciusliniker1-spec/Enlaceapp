export type Status = "cotacao" | "contratado" | "descartado";
export type Method = "pix" | "boleto" | "cartao";
export interface Wedding {
  id: string; partner1: string; partner2: string; date: string; time: string; city: string; venue: string;
  style: "classico" | "jardim" | "praia" | "gala" | "civil"; palette: number; budget: number; guestsEstimate: number;
  phone: string; ceremonyPlace: string; ceremonyAddr: string; receptionPlace: string; receptionAddr: string;
  dress: string; rsvpDeadline: string; message: string; liveTogether: boolean; homeType: "casa" | "apto"; honeymoon: boolean;
}
export interface Vendor { id: string; name: string; category: string; contact: string; phone: string; status: Status; value: number; notes: string; docs: string[]; }
export interface Payment { id: string; vendorId: string; label: string; amount: number; due: string; method: Method; paid: boolean; paidAt?: string; }
export interface BudgetCat { id: string; name: string; planned: number; }
export interface Guest { id: string; name: string; group: string; list: "A" | "B"; rsvp: "pendente" | "confirmado" | "recusado"; fee: "inteira" | "meia" | "isenta"; tableId?: string; phone: string; }
export interface Table { id: string; name: string; seats: number; x: number; y: number; kind: "mesa" | "casal" | "pista" | "bar" | "bolo"; }
export interface Task { id: string; title: string; phase: number; done: boolean; due?: string; owner: string; }
export interface Gift { id: string; title: string; category: string; price: number; url: string; qty: number; got: number; reservedBy: string[]; kind: "casa" | "lua-de-mel" | "cota"; }
export interface EnxovalItem { id: string; room: string; name: string; qty: number; state: "novo" | "tenho" | "falta" | "comprado"; essential: boolean; }
export interface Moment { id: string; time: string; title: string; who: string; }
export interface Recado { id: string; from: string; text: string; date: string; }
export interface Member { id: string; email: string; role: "editar" | "ver"; }
export interface WeddingData {
  wedding: Wedding; vendors: Vendor[]; payments: Payment[]; cats: BudgetCat[]; guests: Guest[]; tables: Table[];
  tasks: Task[]; gifts: Gift[]; enxoval: EnxovalItem[]; moments: Moment[]; recados: Recado[]; members: Member[];
}
export interface AppState { role: "casal" | "assessor"; activeId: string | null; weddings: Record<string, WeddingData>; hideMoney: boolean; onboarded: boolean; }
