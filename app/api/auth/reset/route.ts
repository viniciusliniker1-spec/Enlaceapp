import { one, run, now, N } from "@/lib/server/db";
import { hashPass, json, fail, rateLimit, ipOf } from "@/lib/server/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!(await rateLimit("reset:" + ipOf(req), 10, 900000))) return fail("Muitas tentativas.", 429);
  const b = (await req.json().catch(() => ({}))) as { token?: string; password?: string }; if ((b.password ?? "").length < 8) return fail("A senha precisa de pelo menos 8 caracteres.");
  const t = await one<{ user_id: string; expires_at: unknown }>("SELECT user_id, expires_at FROM reset_tokens WHERE token = ?", b.token ?? ""); if (!t || N(t.expires_at) < now()) return fail("Link inválido ou expirado. Peça um novo.", 400);
  await run("UPDATE users SET pass = ? WHERE id = ?", hashPass(b.password!), t.user_id); await run("DELETE FROM reset_tokens WHERE user_id = ?", t.user_id); await run("DELETE FROM sessions WHERE user_id = ?", t.user_id);
  return json({ ok: true });
}
