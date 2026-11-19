import { json, fail } from "@/lib/server/auth";
import { onAsaasEvent } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN; const got = req.headers.get("asaas-access-token");
  if (!expected || got !== expected) { console.warn(`[webhook asaas] recusado: ${!expected ? "ASAAS_WEBHOOK_TOKEN não configurado no servidor" : got ? "token diferente do configurado" : "sem cabeçalho asaas-access-token"}`); return fail("Não autorizado.", 401); }
  const ev = await req.json().catch(() => null); if (!ev?.event) return fail("Evento inválido.");
  console.log(`[webhook asaas] evento ${ev.event}`); await onAsaasEvent(ev); return json({ ok: true });
}
