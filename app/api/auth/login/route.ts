import { one } from "@/lib/server/db";
import { checkPass, startSession, json, fail, claimInvitesFor, rateLimit, ipOf, type User } from "@/lib/server/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!(await rateLimit("login:" + ipOf(req), 12, 600000))) return fail("Muitas tentativas. Aguarde alguns minutos.", 429);
  const b = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const u = await one<User & { pass: string }>("SELECT id, email, name, role, pass FROM users WHERE email = ?", (b.email ?? "").trim().toLowerCase());
  if (!u || !checkPass(b.password ?? "", u.pass)) return fail("E-mail ou senha incorretos.", 401);
  await claimInvitesFor(u); await startSession(u.id); return json({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
}
