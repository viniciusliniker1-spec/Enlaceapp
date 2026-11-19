import { currentUser, json, fail, memberRole } from "@/lib/server/auth";
import { accessFor, startCheckout, cancelSubscription, billingConfigured, billingDiag, syncFromAsaas } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; if (!(await memberRole(id, u.id))) return fail("Sem acesso.", 403);
  let a = await accessFor(id); if (a.state !== "active" || a.canceled === false && a.status !== "active") { if (await syncFromAsaas(a.scope)) a = await accessFor(id); }
  return json({ ...a, configured: billingConfigured(), diag: billingDiag() });
}
export async function POST(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; if ((await memberRole(id, u.id)) !== "owner") return fail("Só quem criou o casamento pode assinar.", 403);
  const b = (await req.json().catch(() => ({}))) as { cpfCnpj?: string; action?: string }; const a = await accessFor(id);
  try {
    if (b.action === "cancel") { await cancelSubscription(a.scope); return json({ ok: true }); }
    const doc = (b.cpfCnpj ?? "").replace(/\D/g, ""); if (doc.length !== 11 && doc.length !== 14) return fail("Informe um CPF ou CNPJ válido para emitir a cobrança.");
    return json({ url: await startCheckout(a.scope, a.plan, u, doc) });
  } catch (e) { const m = (e as Error).message; return fail(m === "billing_not_configured" ? "A cobrança ainda não foi ativada neste servidor." : m, m === "billing_not_configured" ? 503 : 502); }
}
