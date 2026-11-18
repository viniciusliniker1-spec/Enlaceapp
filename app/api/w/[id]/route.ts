import { run } from "@/lib/server/db";
import { currentUser, json, fail, memberRole } from "@/lib/server/auth";
export const runtime = "nodejs";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params;
  if ((await memberRole(id, u.id)) !== "owner") return fail("Só quem criou o casamento pode excluí-lo.", 403);
  await run("DELETE FROM weddings WHERE id = ?", id); return json({ ok: true });
}
