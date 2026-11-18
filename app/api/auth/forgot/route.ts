import { one, run, now } from "@/lib/server/db";
import { rid, json, fail, rateLimit, ipOf } from "@/lib/server/auth";
import { sendEmail, appUrl } from "@/lib/server/email";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!(await rateLimit("forgot:" + ipOf(req), 6, 900000))) return fail("Muitas tentativas. Aguarde alguns minutos.", 429);
  const b = (await req.json().catch(() => ({}))) as { email?: string }; const email = (b.email ?? "").trim().toLowerCase();
  const u = await one<{ id: string; name: string }>("SELECT id, name FROM users WHERE email = ?", email);
  if (u) { const token = rid(32); await run("INSERT INTO reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)", token, u.id, now() + 3600000);
    await sendEmail(email, "Redefinir sua senha no Enlace", "Redefinir senha", `Oi, ${u.name}! Recebemos um pedido para redefinir a sua senha. O link vale por 1 hora. Se não foi você, ignore este e-mail.`, { href: `${appUrl(req)}/redefinir?token=${token}`, label: "Criar nova senha" }); }
  return json({ ok: true }); // resposta igual exista ou não a conta
}
