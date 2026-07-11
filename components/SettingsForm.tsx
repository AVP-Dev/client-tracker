"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SettingsForm() {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      const t = s.telegramBotToken || "";
      const c = s.telegramChatId || "";
      setToken(t);
      setChatId(c);
      setSaved(!!t && !!c);
      setReady(true);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api.saveSettings({ telegramBotToken: token, telegramChatId: chatId });
    setLoading(false);
    setOk(true);
    setSaved(true);
    setShow(false);
    setTimeout(() => setOk(false), 2500);
  }

  function edit() {
    setShow(true);
    setSaved(false);
  }

  if (!ready) return <div className="ui-card p-5"><p className="text-xs text-gray-300">Загрузка...</p></div>;

  // Настроено — показываем статус
  if (saved && !show) {
    return (
      <div className="ui-card p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-0.5">Telegram-уведомления</h2>
        <p className="text-xs text-gray-400 mb-3">Оповещения о новых клиентах</p>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 mb-3">
          <span className="text-emerald-600">✅</span>
          <span className="text-sm text-emerald-700 font-medium">Настроено</span>
        </div>

        <button onClick={edit} className="ui-btn ui-btn-secondary w-full text-xs">
          Изменить настройки
        </button>
      </div>
    );
  }

  // Форма ввода
  return (
    <div className="ui-card p-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-0.5">Telegram-уведомления</h2>
      <p className="text-xs text-gray-400 mb-4">Оповещения о новых клиентах</p>
      <form onSubmit={save} className="flex flex-col gap-3">
        <div>
          <label className="ui-label">Bot Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456:ABC-DEF..."
            className="ui-input"
            style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Получите у <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@BotFather</a>
          </p>
        </div>
        <div>
          <label className="ui-label">Chat ID</label>
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="-1001234567890"
            className="ui-input"
            style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
          />
        </div>
        {ok && <div className="ui-alert ui-alert-success">✅ Сохранено</div>}
        <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full">
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        {saved && (
          <button type="button" onClick={() => { setShow(false); setSaved(true); }} className="ui-btn ui-btn-ghost w-full text-xs">
            Отмена
          </button>
        )}
      </form>
    </div>
  );
}
