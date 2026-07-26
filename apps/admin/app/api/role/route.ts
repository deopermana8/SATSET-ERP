import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
