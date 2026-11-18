import { one, run, now } from "@/lib/server/db";
import { hashPass, startSession, rid, json, fail, claimInvitesFor, rateLimit, ipOf } from "@/lib/server/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!(await rateLimit("reg:" + ipOf(req), 10, 600000))) return fail("Muitas tentativas. Aguarde alguns minutos.", 429);
  const b = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string; role?: string };
  const email = (b.email ?? "").trim().toLowerCase(); const name = (b.name ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("E-mail inválido."); if ((b.password ?? "").length < 8) return fail("A senha precisa de pelo menos 8 caracteres."); if (!name) return fail("Informe seu nome.");
  if (await one("SELECT 1 AS x FROM users WHERE email = ?", email)) return fail("Já existe uma conta com esse e-mail.", 409);
  const id = rid(); const role = b.role === "assessor" ? "assessor" : "casal";
  await run("INSERT INTO users (id, email, name, pass, role, created_at) VALUES (?, ?, ?, ?, ?, ?)", id, email, name, hashPass(b.password!), role, now());
  await claimInvitesFor({ id, email, name, role }); await startSession(id); return json({ user: { id, email, name, role } });
}
