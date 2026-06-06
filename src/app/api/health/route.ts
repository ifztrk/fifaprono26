import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Route de diagnostic : vérifie la connexion à la base depuis le runtime de prod.
export async function GET() {
  try {
    const [users, teams, matches] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.match.count(),
    ]);
    return NextResponse.json({ ok: true, users, teams, matches });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
