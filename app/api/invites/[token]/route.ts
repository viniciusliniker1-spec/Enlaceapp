import { one } from "@/lib/server/db";
import { json } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const i = await one<{ email: string }>("SELECT email FROM member_invites WHERE token = ?", token); return json({ email: i?.email ?? null });
}
