import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const counts = await prisma.client.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const result = { NEW: 0, IN_PROGRESS: 0, CLOSED: 0 };
  for (const row of counts) {
    if (row.status === "NEW" || row.status === "IN_PROGRESS" || row.status === "CLOSED") {
      result[row.status] = row._count.status;
    }
  }

  return NextResponse.json(result);
}
