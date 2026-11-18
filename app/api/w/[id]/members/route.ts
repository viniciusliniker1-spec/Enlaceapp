import { one, run, now } from "@/lib/server/db";
import { currentUser, json, fail, memberRole, rid } from "@/lib/server/auth";
import { members } from "@/lib/server/wedding";
import { sendEmail, appUrl } from "@/lib/server/email";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
export async function POST(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params;
  if ((await memberRole(id, u.id)) !== "owner") return fail("Só quem criou o casamento pode convidar.", 403);
  const b = (await req.json().catch(() => ({}))) as { email?: string; role?: string }; const email = (b.email ?? "").trim().toLowerCase(); const role = b.role === "ver" ? "ver" : "editar";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("E-mail inválido.");
  const w = await one<{ body: string }>("SELECT body FROM records WHERE wedding_id = ? AND coll = 'wedding' AND id = 'main'", id); const wd = w ? JSON.parse(w.body) : { partner1: "", partner2: "" }; const names = `${wd.partner1} e ${wd.partner2}`;
  const ex = await one<{ id: string }>("SELECT id FROM users WHERE email = ?", email);
  if (ex) { await run("INSERT INTO members (wedding_id, user_id, role) VALUES (?, ?, ?) ON CONFLICT (wedding_id, user_id) DO UPDATE SET role = EXCLUDED.role", id, ex.id, role);
    await sendEmail(email, `${u.name} adicionou você ao casamento de ${names}`, "Você foi adicionado a um casamento", `${u.name} deu a você acesso ${role === "ver" ? "para visualizar" : "para editar"} o planejamento do casamento de ${names}.`, { href: `${appUrl(req)}/app`, label: "Abrir o Enlace" }); return json({ ...(await members(id)), link: null }); }
  const token = rid(16); await run("INSERT INTO member_invites (token, wedding_id, email, role, created_at) VALUES (?, ?, ?, ?, ?)", token, id, email, role, now());
  const href = `${appUrl(req)}/entrar?convite=${token}`;
  const sent = await sendEmail(email, `${u.name} convidou você para planejar o casamento de ${names}`, "Convite para planejar junto", `${u.name} convidou você para ${role === "ver" ? "acompanhar" : "editar"} o planejamento do casamento de ${names} no Enlace. Crie sua conta com este e-mail para entrar.`, { href, label: "Aceitar convite" });
  return json({ ...(await members(id)), link: `/entrar?convite=${token}`, emailed: sent });
}
export async function PATCH(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; if ((await memberRole(id, u.id)) !== "owner") return fail("Sem permissão.", 403);
  const b = (await req.json().catch(() => ({}))) as { userId?: string; role?: string }; if (!b.userId) return fail("Dados inválidos.");
  await run("UPDATE members SET role = ? WHERE wedding_id = ? AND user_id = ?", b.role === "ver" ? "ver" : "editar", id, b.userId); return json(await members(id));
}
export async function DELETE(req: Request, { params }: Ctx) {
  const u = await currentUser(); if (!u) return fail("Não autenticado.", 401); const { id } = await params; const q = new URL(req.url).searchParams;
  const uid = q.get("userId"), tok = q.get("invite"); const r = await memberRole(id, u.id);
  if (uid) { if (r !== "owner" && uid !== u.id) return fail("Sem permissão.", 403); await run("DELETE FROM members WHERE wedding_id = ? AND user_id = ?", id, uid); }
  else if (tok) { if (r !== "owner") return fail("Sem permissão.", 403); await run("DELETE FROM member_invites WHERE token = ? AND wedding_id = ?", tok, id); }
  return json(await members(id));
}
