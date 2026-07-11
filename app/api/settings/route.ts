import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const map = new Map(settings.map((s) => [s.key, s.value]));
  return NextResponse.json({
    telegramBotToken: map.get("TELEGRAM_BOT_TOKEN") || "",
    telegramChatId: map.get("TELEGRAM_CHAT_ID") || "",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { telegramBotToken, telegramChatId } = body;

  await prisma.setting.upsert({
    where: { key: "TELEGRAM_BOT_TOKEN" },
    update: { value: telegramBotToken || "" },
    create: { key: "TELEGRAM_BOT_TOKEN", value: telegramBotToken || "" },
  });

  await prisma.setting.upsert({
    where: { key: "TELEGRAM_CHAT_ID" },
    update: { value: telegramChatId || "" },
    create: { key: "TELEGRAM_CHAT_ID", value: telegramChatId || "" },
  });

  return NextResponse.json({ ok: true });
}
