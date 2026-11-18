export const appUrl = (req?: Request) => process.env.APP_URL?.replace(/\/$/, "") || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : req ? new URL(req.url).origin : "http://localhost:3000");
const shell = (title: string, body: string, cta?: { href: string; label: string }) => `<div style="font-family:Inter,Arial,sans-serif;background:#fbf7f1;padding:32px"><div style="max-width:480px;margin:auto;background:#fff;border:1px solid #e9e0d4;border-radius:16px;padding:28px;color:#231f1c"><div style="font-size:22px;font-weight:700;color:#3f5b4b;margin-bottom:16px">Enlace</div><h1 style="font-size:20px;margin:0 0 12px">${title}</h1><p style="font-size:15px;line-height:1.6;color:#6b625a">${body}</p>${cta ? `<p style="margin:24px 0"><a href="${cta.href}" style="background:#3f5b4b;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${cta.label}</a></p><p style="font-size:12px;color:#6b625a">Se o botão não abrir, copie este endereço:<br>${cta.href}</p>` : ""}</div></div>`;
export async function sendEmail(to: string, subject: string, title: string, body: string, cta?: { href: string; label: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY; const from = process.env.EMAIL_FROM || "Enlace <onboarding@resend.dev>";
  if (!key) { console.log(`[email não enviado: RESEND_API_KEY ausente] para ${to}: ${subject} ${cta?.href ?? ""}`); return false; }
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ from, to, subject, html: shell(title, body, cta) }), signal: AbortSignal.timeout(10000) });
    if (!r.ok) console.error("Resend:", r.status, await r.text().catch(() => "")); return r.ok;
  } catch (e) { console.error("Resend falhou:", (e as Error).message); return false; }
}
