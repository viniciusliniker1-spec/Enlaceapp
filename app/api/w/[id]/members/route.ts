import { one, run, now } from "@/lib/server/db";
import { currentUser, json, fail, memberRole, rid } from "@/lib/server/auth";
import { members } from "@/lib/server/wedding";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function POST(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; const r = memberRole(id, u.id);
  if (r !== "owner") return fail("Só quem criou o casamento pode convidar.", 403);
  const b = (await req.json().catch(() => ({}))) as { email?: string; role?: string }; const email = (b.email ?? "").trim().toLowerCase(); const role = b.role === "ver" ? "ver" : "editar";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("E-mail inválido.");
  const ex = one<{ id: string }>("SELECT id FROM users WHERE email = ?", email);
  if (ex) { run("INSERT OR REPLACE INTO members (wedding_id, user_id, role) VALUES (?, ?, ?)", id, ex.id, role); return json({ ...members(id), link: null }); }
  const token = rid(16); run("INSERT INTO member_invites (token, wedding_id, email, role, created_at) VALUES (?, ?, ?, ?, ?)", token, id, email, role, now());
  return json({ ...members(id), link: `/entrar?convite=${token}` });
}
export async function PATCH(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; if (memberRole(id, u.id) !== "owner") return fail("Sem permissão.", 403);
  const b = (await req.json().catch(() => ({}))) as { userId?: string; role?: string }; if (!b.userId) return fail("Dados inválidos.");
  run("UPDATE members SET role = ? WHERE wedding_id = ? AND user_id = ?", b.role === "ver" ? "ver" : "editar", id, b.userId); return json(members(id));
}
export async function DELETE(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; const q = new URL(req.url).searchParams;
  const uid = q.get("userId"), tok = q.get("invite"); const r = memberRole(id, u.id);
  if (uid) { if (r !== "owner" && uid !== u.id) return fail("Sem permissão.", 403); run("DELETE FROM members WHERE wedding_id = ? AND user_id = ?", id, uid); }
  else if (tok) { if (r !== "owner") return fail("Sem permissão.", 403); run("DELETE FROM member_invites WHERE token = ? AND wedding_id = ?", tok, id); }
  return json(members(id));
}
