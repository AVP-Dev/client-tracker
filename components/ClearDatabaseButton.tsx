"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ClearDatabaseButton({ onCleared }: { onCleared: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function clear() {
    setLoading(true);
    await api.clearAll();
    setLoading(false); setConfirming(false); onCleared();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="ui-btn ui-btn-danger w-full">
        Очистить базу
      </button>
    );
  }

  return (
    <div className="ui-card p-4 border-red-200 ui-animate-in" style={{ borderColor: "var(--c-error-600)" }}>
      <p className="text-sm font-medium text-red-700 mb-3">⚠️ Все клиенты и настройки будут удалены</p>
      <div className="flex gap-2">
        <button onClick={clear} disabled={loading} className="ui-btn ui-btn-danger flex-1">
          {loading ? "..." : "Да, удалить"}
        </button>
        <button onClick={() => setConfirming(false)} className="ui-btn ui-btn-secondary flex-1">Отмена</button>
      </div>
    </div>
  );
}
