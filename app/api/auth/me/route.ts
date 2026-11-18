import { currentUser, json } from "@/lib/server/auth";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET() { return json({ user: await currentUser() }); }
