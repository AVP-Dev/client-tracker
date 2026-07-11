"use server";

import { prisma } from "@/lib/prisma";
import { sendTelegramNotification } from "@/lib/telegram";
import { Status } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ── Clients ───────────────────────────────────────────────

export async function getClients(statusFilter?: string | null) {
  const where =
    statusFilter && Object.values(Status).includes(statusFilter as Status)
      ? { status: statusFilter as Status }
      : {};

  return prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getStatusCounts() {
  const counts = await prisma.client.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const result: { NEW: number; IN_PROGRESS: number; CLOSED: number } = {
    NEW: 0,
    IN_PROGRESS: 0,
    CLOSED: 0,
  };

  for (const row of counts) {
    if (
      row.status === "NEW" ||
      row.status === "IN_PROGRESS" ||
      row.status === "CLOSED"
    ) {
      result[row.status] = row._count.status;
    }
  }

  return result;
}

export async function addClient(prevState: any, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || "";

  if (!name) return { error: "Имя клиента обязательно" };
  if (name.length > 200) return { error: "Имя слишком длинное (макс. 200)" };
  if (!phone) return { error: "Телефон обязателен" };
  if (phone.length > 50) return { error: "Телефон слишком длинный" };

  const existing = await prisma.client.findFirst({
    where: { name, phone },
  });
  if (existing)
    return { error: "Клиент с таким именем и телефоном уже существует" };

  const client = await prisma.client.create({
    data: { name, phone, notes, status: "NEW" },
  });

  sendTelegramNotification(client.name, client.phone, client.status).catch(
    (err) => console.error("Telegram failed:", err)
  );

  revalidatePath("/");
  return { success: true, client };
}

export async function updateClient(prevState: any, formData: FormData) {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || "";

  if (!id || isNaN(id)) return { error: "Некорректный ID" };
  if (!name) return { error: "Имя обязательно" };
  if (!phone) return { error: "Телефон обязателен" };

  try {
    await prisma.client.update({
      where: { id },
      data: { name, phone, notes },
    });
  } catch {
    return { error: "Клиент не найден" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateClientStatus(clientId: number, status: Status) {
  if (!clientId || isNaN(clientId)) return { error: "Некорректный ID" };
  if (!Object.values(Status).includes(status))
    return { error: "Некорректный статус" };

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { status },
    });
  } catch {
    return { error: "Клиент не найден" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteClient(clientId: number) {
  if (!clientId || isNaN(clientId)) return { error: "Некорректный ID" };

  try {
    await prisma.client.delete({ where: { id: clientId } });
  } catch {
    return { error: "Клиент не найден" };
  }

  revalidatePath("/");
  return { success: true };
}

// ── Settings ──────────────────────────────────────────────

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const map = new Map(settings.map((s) => [s.key, s.value]));
  return {
    telegramBotToken: map.get("TELEGRAM_BOT_TOKEN") || "",
    telegramChatId: map.get("TELEGRAM_CHAT_ID") || "",
  };
}

export async function saveSettings(prevState: any, formData: FormData) {
  const token = (formData.get("telegramBotToken") as string)?.trim() || "";
  const chatId = (formData.get("telegramChatId") as string)?.trim() || "";

  await prisma.setting.upsert({
    where: { key: "TELEGRAM_BOT_TOKEN" },
    update: { value: token },
    create: { key: "TELEGRAM_BOT_TOKEN", value: token },
  });
  await prisma.setting.upsert({
    where: { key: "TELEGRAM_CHAT_ID" },
    update: { value: chatId },
    create: { key: "TELEGRAM_CHAT_ID", value: chatId },
  });

  revalidatePath("/");
  return { success: true };
}

// ── Clear Database ────────────────────────────────────────

export async function clearAllClients() {
  await prisma.client.deleteMany();
  revalidatePath("/");
  return { success: true };
}
