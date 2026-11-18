import { json, fail } from "@/lib/server/auth";
import { onAsaasEvent } from "@/lib/server/billing";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN; if (!expected || req.headers.get("asaas-access-token") !== expected) return fail("Não autorizado.", 401);
  const ev = await req.json().catch(() => null); if (!ev?.event) return fail("Evento inválido.");
  await onAsaasEvent(ev); return json({ ok: true });
}
