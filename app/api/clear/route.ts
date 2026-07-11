import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  await prisma.$transaction([
    prisma.client.deleteMany(),
    prisma.setting.deleteMany(),
  ]);
  return NextResponse.json({ ok: true });
}
