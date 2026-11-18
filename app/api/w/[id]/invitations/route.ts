import { currentUser, json, fail, memberRole } from "@/lib/server/auth";
import { ensureInvitations } from "@/lib/server/wedding";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; const r = memberRole(id, u.id); if (!r) return fail("Sem acesso.", 403);
  return json({ tokens: ensureInvitations(id) });
}
