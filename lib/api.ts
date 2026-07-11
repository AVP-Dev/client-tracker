export async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

export const api = {
  getClients: (status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return apiFetch(`/api/clients?${params}`);
  },

  getCounts: () => apiFetch("/api/counts"),

  getSettings: () => apiFetch("/api/settings"),

  createClient: (data: { name: string; phone: string; notes?: string }) =>
    apiFetch("/api/clients", { method: "POST", body: JSON.stringify(data) }),

  updateClient: (data: { id: number; name?: string; phone?: string; notes?: string; status?: string }) =>
    apiFetch("/api/clients", { method: "PATCH", body: JSON.stringify(data) }),

  deleteClient: (id: number) =>
    apiFetch(`/api/clients?id=${id}`, { method: "DELETE" }),

  saveSettings: (data: { telegramBotToken: string; telegramChatId: string }) =>
    apiFetch("/api/settings", { method: "POST", body: JSON.stringify(data) }),

  clearAll: () =>
    apiFetch("/api/clear", { method: "POST" }),
};
