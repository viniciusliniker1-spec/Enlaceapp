import type { WeddingData } from "./types";
import { daysUntil } from "./utils";
export function calc(d: WeddingData) {
  const contracted = d.vendors.filter((v) => v.status === "contratado");
  const closed = contracted.reduce((s, v) => s + v.value, 0);
  const pays = d.payments.filter((p) => { const v = d.vendors.find((x) => x.id === p.vendorId); return v && v.status !== "descartado"; });
  const paid = pays.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  const toPay = pays.filter((p) => !p.paid).reduce((s, p) => s + p.amount, 0);
  const overdue = pays.filter((p) => !p.paid && daysUntil(p.due) < 0);
  const next7 = pays.filter((p) => !p.paid && daysUntil(p.due) >= 0 && daysUntil(p.due) <= 7).sort((a, b) => a.due.localeCompare(b.due));
  const gA = d.guests.filter((g) => g.list === "A"); const gB = d.guests.filter((g) => g.list === "B");
  const confirmed = gA.filter((g) => g.rsvp === "confirmado").length; const pending = gA.filter((g) => g.rsvp === "pendente").length; const declined = gA.filter((g) => g.rsvp === "recusado").length;
  const tasksDone = d.tasks.filter((t) => t.done).length;
  const undefinedPay = contracted.filter((v) => !d.payments.some((p) => p.vendorId === v.id));
  const budget = d.wedding.budget; const used = Math.max(closed, 0);
  const payers = gA.filter((g) => g.rsvp !== "recusado" && g.fee !== "isenta").reduce((s, g) => s + (g.fee === "meia" ? 0.5 : 1), 0);
  return { contracted, closed, paid, toPay, overdue, next7, gA, gB, confirmed, pending, declined, tasksDone, undefinedPay, budget, used, available: budget - used, payers };
}
