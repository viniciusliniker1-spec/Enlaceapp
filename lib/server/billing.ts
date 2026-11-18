import { one, run, now, N, type Ex, X } from "./db";

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS ?? 7); export const PRICES = { casal: 34.9, assessor: 129 };
export type Access = { state: "trial" | "active" | "blocked"; daysLeft: number; status: string; scope: string; plan: "casal" | "assessor"; price: number; paidUntil: number; canceled: boolean };
export async function scopeFor(weddingId: string, x: Ex = X): Promise<{ scope: string; plan: "casal" | "assessor"; ownerId: string }> {
  const o = await x.one<{ owner_id: string; role: "casal" | "assessor" }>("SELECT w.owner_id, u.role FROM weddings w JOIN users u ON u.id = w.owner_id WHERE w.id = ?", weddingId);
  if (!o) return { scope: `w:${weddingId}`, plan: "casal", ownerId: "" };
  return o.role === "assessor" ? { scope: `u:${o.owner_id}`, plan: "assessor", ownerId: o.owner_id } : { scope: `w:${weddingId}`, plan: "casal", ownerId: o.owner_id };
}
export async function ensureBilling(scope: string, x: Ex = X) { await x.run("INSERT INTO billing (scope, status, trial_ends, paid_until, updated_at) VALUES (?, 'trial', ?, 0, ?) ON CONFLICT (scope) DO NOTHING", scope, now() + TRIAL_DAYS * 86400000, now()); }
export async function accessFor(weddingId: string, x: Ex = X): Promise<Access> {
  const { scope, plan } = await scopeFor(weddingId, x); await ensureBilling(scope, x);
  const b = (await x.one<{ status: string; trial_ends: unknown; paid_until: unknown }>("SELECT status, trial_ends, paid_until FROM billing WHERE scope = ?", scope))!;
  const t = now(); const trialEnds = N(b.trial_ends), paidUntil = N(b.paid_until); const grace = 3 * 86400000;
  const state = paidUntil > 0 && paidUntil + grace > t ? "active" : trialEnds > t ? "trial" : "blocked";
  const end = state === "active" ? paidUntil : trialEnds;
  return { state, daysLeft: Math.max(0, Math.ceil((end - t) / 86400000)), status: b.status, scope, plan, price: PRICES[plan], paidUntil, canceled: b.status === "canceled" };
}
export const paywall = { error: "O período grátis terminou. Assine para continuar editando.", code: "payment_required" };

const base = () => (process.env.ASAAS_SANDBOX === "1" ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3");
async function asaas<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const key = process.env.ASAAS_API_KEY; if (!key) throw new Error("billing_not_configured");
  const r = await fetch(base() + path, { method, headers: { access_token: key, "content-type": "application/json", "user-agent": "enlace" }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
  const j = (await r.json().catch(() => ({}))) as { errors?: { description: string }[] } & T; if (!r.ok) throw new Error(j.errors?.[0]?.description || `Asaas respondeu ${r.status}`); return j;
}
export const billingConfigured = () => !!process.env.ASAAS_API_KEY;
export async function startCheckout(scope: string, plan: "casal" | "assessor", user: { name: string; email: string }, cpfCnpj: string): Promise<string> {
  const row = await one<{ customer_id: string | null; subscription_id: string | null; status: string }>("SELECT customer_id, subscription_id, status FROM billing WHERE scope = ?", scope);
  let customer = row?.customer_id; let sub = row?.subscription_id;
  if (!customer) { const c = await asaas<{ id: string }>("/customers", "POST", { name: user.name, email: user.email, cpfCnpj: cpfCnpj.replace(/\D/g, ""), externalReference: scope }); customer = c.id; }
  if (!sub || row?.status === "canceled") { const s = await asaas<{ id: string }>("/subscriptions", "POST", { customer, billingType: "UNDEFINED", value: PRICES[plan], nextDueDate: new Date().toISOString().slice(0, 10), cycle: "MONTHLY", description: plan === "assessor" ? "Enlace Assessor" : "Enlace Casal", externalReference: scope }); sub = s.id; }
  await run("UPDATE billing SET customer_id = ?, subscription_id = ?, updated_at = ? WHERE scope = ?", customer, sub, now(), scope);
  const p = await asaas<{ data: { invoiceUrl: string; status: string }[] }>(`/subscriptions/${sub}/payments`);
  const open = p.data.find((x) => x.status === "PENDING" || x.status === "OVERDUE") ?? p.data[0]; if (!open?.invoiceUrl) throw new Error("Não foi possível gerar a cobrança. Tente novamente."); return open.invoiceUrl;
}
export async function cancelSubscription(scope: string) {
  const row = await one<{ subscription_id: string | null }>("SELECT subscription_id FROM billing WHERE scope = ?", scope); if (row?.subscription_id) await asaas(`/subscriptions/${row.subscription_id}`, "DELETE");
  await run("UPDATE billing SET status = 'canceled', updated_at = ? WHERE scope = ?", now(), scope);
}
export async function onAsaasEvent(ev: { id?: string; event: string; payment?: { subscription?: string; externalReference?: string }; subscription?: { id: string; externalReference?: string } }) {
  if (ev.id) { const d = await one("SELECT 1 AS x FROM webhook_events WHERE id = ?", ev.id); if (d) return; await run("INSERT INTO webhook_events (id, t) VALUES (?, ?) ON CONFLICT DO NOTHING", ev.id, now()); }
  const subId = ev.payment?.subscription ?? ev.subscription?.id; const ref = ev.payment?.externalReference ?? ev.subscription?.externalReference;
  const row = subId ? await one<{ scope: string }>("SELECT scope FROM billing WHERE subscription_id = ?", subId) : ref ? await one<{ scope: string }>("SELECT scope FROM billing WHERE scope = ?", ref) : null; if (!row) return;
  if (ev.event === "PAYMENT_CONFIRMED" || ev.event === "PAYMENT_RECEIVED") await run("UPDATE billing SET status = 'active', paid_until = ?, updated_at = ? WHERE scope = ?", now() + 31 * 86400000, now(), row.scope);
  else if (ev.event === "PAYMENT_OVERDUE") await run("UPDATE billing SET status = 'past_due', updated_at = ? WHERE scope = ? AND status = 'active'", now(), row.scope);
  else if (ev.event === "SUBSCRIPTION_DELETED" || ev.event === "SUBSCRIPTION_INACTIVATED") await run("UPDATE billing SET status = 'canceled', updated_at = ? WHERE scope = ?", now(), row.scope);
}
