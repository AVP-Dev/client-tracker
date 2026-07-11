import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      groupBy: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    setting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/telegram", () => ({
  sendTelegramNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  getClients,
  getStatusCounts,
  addClient,
  updateClient,
  updateClientStatus,
  deleteClient,
  getSettings,
  saveSettings,
  clearAllClients,
} from "@/actions/clients";

const mockPrisma = prisma as any;

describe("getClients", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all clients when no filter", async () => {
    mockPrisma.client.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await getClients();
    expect(result).toEqual([{ id: 1 }]);
  });

  it("filters by status", async () => {
    mockPrisma.client.findMany.mockResolvedValue([]);
    await getClients("NEW");
    expect(mockPrisma.client.findMany).toHaveBeenCalledWith({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getStatusCounts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns correct counts", async () => {
    mockPrisma.client.groupBy.mockResolvedValue([
      { status: "NEW", _count: { status: 3 } },
    ]);
    const result = await getStatusCounts();
    expect(result).toEqual({ NEW: 3, IN_PROGRESS: 0, CLOSED: 0 });
  });
});

describe("addClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates client", async () => {
    const formData = new FormData();
    formData.set("name", "Иванов");
    formData.set("phone", "+79991234567");
    mockPrisma.client.findFirst.mockResolvedValue(null);
    mockPrisma.client.create.mockResolvedValue({ id: 1, name: "Иванов" });
    const result = await addClient(null, formData);
    expect(result.success).toBe(true);
  });

  it("blocks duplicates", async () => {
    const formData = new FormData();
    formData.set("name", "Иванов");
    formData.set("phone", "+79991234567");
    mockPrisma.client.findFirst.mockResolvedValue({ id: 1 });
    const result = await addClient(null, formData);
    expect(result.error).toContain("уже существует");
  });
});

describe("updateClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates client", async () => {
    const formData = new FormData();
    formData.set("id", "1");
    formData.set("name", "Новое");
    formData.set("phone", "+7000");
    mockPrisma.client.update.mockResolvedValue({});
    const result = await updateClient(null, formData);
    expect(result).toEqual({ success: true });
  });
});

describe("updateClientStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates status", async () => {
    mockPrisma.client.update.mockResolvedValue({});
    const result = await updateClientStatus(1, "IN_PROGRESS");
    expect(result).toEqual({ success: true });
  });
});

describe("deleteClient", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes client", async () => {
    mockPrisma.client.delete.mockResolvedValue({});
    const result = await deleteClient(1);
    expect(result).toEqual({ success: true });
  });
});

describe("clearAllClients", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes all", async () => {
    mockPrisma.client.deleteMany.mockResolvedValue({ count: 5 });
    const result = await clearAllClients();
    expect(result).toEqual({ success: true });
  });
});

describe("getSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns settings", async () => {
    mockPrisma.setting.findMany.mockResolvedValue([
      { key: "TELEGRAM_BOT_TOKEN", value: "tok" },
    ]);
    const result = await getSettings();
    expect(result.telegramBotToken).toBe("tok");
  });
});

describe("saveSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves settings", async () => {
    mockPrisma.setting.upsert.mockResolvedValue({});
    const formData = new FormData();
    formData.set("telegramBotToken", "tok");
    formData.set("telegramChatId", "chat");
    const result = await saveSettings(null, formData);
    expect(result).toEqual({ success: true });
  });
});
