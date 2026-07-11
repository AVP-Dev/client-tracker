import { prisma } from "./prisma";

async function getTelegramConfig() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"] } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    return {
      token: map.get("TELEGRAM_BOT_TOKEN") || process.env.TELEGRAM_BOT_TOKEN || "",
      chatId: map.get("TELEGRAM_CHAT_ID") || process.env.TELEGRAM_CHAT_ID || "",
    };
  } catch {
    return {
      token: process.env.TELEGRAM_BOT_TOKEN || "",
      chatId: process.env.TELEGRAM_CHAT_ID || "",
    };
  }
}

export async function sendTelegramNotification(
  clientName: string,
  clientPhone: string,
  status: string
): Promise<boolean> {
  const { token, chatId } = await getTelegramConfig();

  if (!token || !chatId) {
    console.warn(
      "Telegram credentials not configured. Skipping notification."
    );
    return false;
  }

  const statusLabels: Record<string, string> = {
    NEW: "Новый",
    IN_PROGRESS: "В работе",
    CLOSED: "Закрыт",
  };

  const text = [
    "📋 *Новый клиент добавлен!*",
    "",
    `👤 *Имя:* ${clientName}`,
    `📞 *Телефон:* ${clientPhone}`,
    `📊 *Статус:* ${statusLabels[status] || status}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      console.error("Telegram API error:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}
