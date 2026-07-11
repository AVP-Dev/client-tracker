import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram";
import { NextRequest, NextResponse } from "next/server";
import { Status } from "@prisma/client";

// GET /api/clients?status=NEW&page=1&limit=20
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 20));
  const skip = (page - 1) * limit;

  const where =
    status && Object.values(Status).includes(status as Status)
      ? { status: status as Status }
      : {};

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit, pages: Math.ceil(total / limit) });
}

// POST /api/clients — создать клиента
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, notes } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "Телефон обязателен" }, { status: 400 });

  const existing = await prisma.client.findFirst({
    where: { name: name.trim(), phone: phone.trim() },
  });
  if (existing) return NextResponse.json({ error: "Дубль" }, { status: 400 });

  const client = await prisma.client.create({
    data: { name: name.trim(), phone: phone.trim(), notes: notes?.trim() || "", status: "NEW" },
  });

  // Telegram-уведомление (fire-and-forget)
  sendTelegramNotification(client.name, client.phone, client.status).catch(
    (err) => console.error("Telegram failed:", err)
  );

  return NextResponse.json(client);
}

// PATCH /api/clients — обновить клиента
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, name, phone, notes, status } = body;

  if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

  const data: any = {};
  if (name !== undefined) data.name = name.trim();
  if (phone !== undefined) data.phone = phone.trim();
  if (notes !== undefined) data.notes = notes.trim();
  if (status !== undefined) data.status = status;

  try {
    const client = await prisma.client.update({ where: { id }, data });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Не найден" }, { status: 404 });
  }
}

// DELETE /api/clients?id=123
export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

  try {
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не найден" }, { status: 404 });
  }
}
