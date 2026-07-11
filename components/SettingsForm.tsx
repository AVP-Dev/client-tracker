"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SettingsForm() {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => { setToken(s.telegramBotToken || ""); setChatId(s.telegramChatId || ""); setReady(true); });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    await api.saveSettings({ telegramBotToken: token, telegramChatId: chatId });
    setLoading(false); setOk(true); setTimeout(() => setOk(false), 2500);
  }

  if (!ready) return <div className="ui-card p-5"><p className="text-xs text-gray-300">Загрузка...</p></div>;

  return (
    <div className="ui-card p-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-0.5">Telegram-уведомления</h2>
      <p className="text-xs text-gray-400 mb-4">Оповещения о новых клиентах</p>
      <form onSubmit={save} className="flex flex-col gap-3">
        <div>
          <label className="ui-label">Bot Token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456:ABC-DEF..."
            className="ui-input" style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }} />
          <p className="text-[11px] text-gray-400 mt-1">
            Получите у <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@BotFather</a>
          </p>
        </div>
        <div>
          <label className="ui-label">Chat ID</label>
          <input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="-1001234567890"
            className="ui-input" style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }} />
        </div>
        {ok && <div className="ui-alert ui-alert-success">✅ Сохранено</div>}
        <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full">
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
