import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { requirePermission } from "@/lib/auth/requirePermission";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();
    
    await requirePermission("user.view");
const users = await prisma.user.findMany({
      include: { role: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}




