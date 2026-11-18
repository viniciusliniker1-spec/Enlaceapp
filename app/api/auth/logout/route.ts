import { endSession, json } from "@/lib/server/auth";
export const runtime = "nodejs";
export async function POST() { await endSession(); return json({ ok: true }); }
