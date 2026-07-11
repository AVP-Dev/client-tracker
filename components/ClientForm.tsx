"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ClientForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setOk(false);
    const r = await api.createClient({ name, phone, notes });
    if (r.error) { setError(r.error); setLoading(false); }
    else { setOk(true); setName(""); setPhone(""); setNotes(""); setLoading(false); onCreated(); setTimeout(() => setOk(false), 2500); }
  }

  return (
    <div className="ui-card p-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Новый клиент</h2>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <label className="ui-label">Имя <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200}
            placeholder="Иванов Иван" className="ui-input" />
        </div>
        <div>
          <label className="ui-label">Телефон <span className="text-red-500">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={50}
            placeholder="+7 999 123-45-67" className="ui-input" />
        </div>
        <div>
          <label className="ui-label">Заметки</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000}
            placeholder="Первичная консультация..." className="ui-textarea"
            style={{ resize: "vertical", minHeight: "60px" }} />
        </div>
        {error && <div className="ui-alert ui-alert-error">❌ {error}</div>}
        {ok && <div className="ui-alert ui-alert-success">✅ Клиент добавлен</div>}
        <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full">
          {loading ? "Добавление..." : "Добавить клиента"}
        </button>
      </form>
    </div>
  );
}
