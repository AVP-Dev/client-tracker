"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Status } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════
   TYPES & CONFIG
   ═══════════════════════════════════════════════════════════ */

interface Client {
  id: number;
  name: string;
  phone: string;
  notes: string;
  status: Status;
  createdAt: string;
}

type StatusCfg = {
  label: string;
  icon: string;
  bg: string;
  text: string;
  ring: string;
};

const STATUS: Record<Status, StatusCfg> = {
  NEW:         { label: "Новый",    icon: "🆕", bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-200" },
  IN_PROGRESS: { label: "В работе", icon: "⚙️", bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200" },
  CLOSED:      { label: "Закрыт",   icon: "✅", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" },
};

const ALL_STATUSES: Status[] = ["NEW", "IN_PROGRESS", "CLOSED"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ═══════════════════════════════════════════════════════════
   MAIN TABLE COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function ClientTable({
  clients,
  onChanged,
  page,
  pages,
  onPageChange,
}: {
  clients: Client[];
  onChanged: () => void;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}) {
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Таблица ── */}
      <div className="ui-card overflow-hidden">
        {/* Header — desktop only */}
        <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px] gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Клиент</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Статус</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Телефон</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Дата</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {clients.map((c) =>
            editId === c.id ? (
              <EditRow key={c.id} client={c} onClose={() => setEditId(null)} onSaved={onChanged} />
            ) : (
              <ViewRow key={c.id} client={c} onEdit={() => setEditId(c.id)} onChanged={onChanged} />
            )
          )}
        </div>
      </div>

      {/* ── Пагинация ── */}
      {pages > 1 && <Pagination page={page} pages={pages} onChange={onPageChange} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VIEW ROW
   ═══════════════════════════════════════════════════════════ */

function ViewRow({
  client,
  onEdit,
  onChanged,
}: {
  client: Client;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [status, setStatus] = useState(client.status);
  const cfg = STATUS[status];

  async function changeStatus(newStatus: Status) {
    setStatus(newStatus);
    await api.updateClient({ id: client.id, status: newStatus });
    onChanged();
  }

  return (
    <div className="group transition-colors hover:bg-gray-50/60">
      {/* ── Main Row ── */}
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_100px_100px] gap-3 md:gap-4 items-center px-5 py-3.5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Circle */}
          <div
            className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center text-xs font-bold ring-2 ${cfg.ring} flex-shrink-0 transition-colors`}
          >
            {initials(client.name)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{client.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 md:hidden">{client.phone}</p>
            {client.notes && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="flex items-center gap-1 mt-1 text-[11px] text-amber-600 hover:text-amber-700"
              >
                <span>📝</span>
                <span>{expanded ? "Скрыть заметку" : "Показать заметку"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value as Status)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border-0 ring-1 ${cfg.ring} ${cfg.bg} ${cfg.text} cursor-pointer appearance-none bg-[length:10px] bg-[right_8px_center] bg-no-repeat pr-6`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
            }}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS[s].icon} {STATUS[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Phone — desktop */}
        <span className="hidden md:block text-sm text-gray-500 truncate">{client.phone}</span>

        {/* Date + Actions */}
        <div className="hidden md:flex items-center justify-end gap-2">
          <span className="text-xs text-gray-400 tabular-nums">{formatDate(client.createdAt)}</span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="ui-icon-btn" title="Изменить">
              ✏️
            </button>
            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)} className="ui-icon-btn hover:!text-red-500 hover:!bg-red-50" title="Удалить">
                🗑️
              </button>
            ) : (
              <div className="flex items-center gap-1 ui-animate-in">
                <button
                  onClick={async () => {
                    await api.deleteClient(client.id);
                    onChanged();
                  }}
                  className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium"
                >
                  Да
                </button>
                <button onClick={() => setConfirmDel(false)} className="text-xs px-2.5 py-1 text-gray-500 hover:text-gray-700">
                  Нет
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-1 col-span-2">
          <span className="text-xs text-gray-400 mr-auto">{formatDate(client.createdAt)}</span>
          <button onClick={onEdit} className="ui-btn ui-btn-ghost text-xs h-8 px-3">
            ✏️ Изменить
          </button>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} className="ui-btn ui-btn-ghost text-xs h-8 px-3 text-gray-400 hover:text-red-500">
              🗑️
            </button>
          ) : (
            <div className="flex items-center gap-1 ui-animate-in">
              <button
                onClick={async () => {
                  await api.deleteClient(client.id);
                  onChanged();
                }}
                className="text-xs px-3 py-1 bg-red-500 text-white rounded-md font-medium"
              >
                Удалить
              </button>
              <button onClick={() => setConfirmDel(false)} className="text-xs px-3 py-1 text-gray-500">
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded Notes ── */}
      {expanded && client.notes && (
        <div className="px-5 pb-4 pt-0 ui-animate-in">
          <div className="ml-[52px] p-3 bg-amber-50/70 rounded-lg border border-amber-100">
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT ROW
   ═══════════════════════════════════════════════════════════ */

function EditRow({
  client,
  onClose,
  onSaved,
}: {
  client: Client;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [notes, setNotes] = useState(client.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const r = await api.updateClient({ id: client.id, name, phone, notes });
    if (r.error) {
      setError(r.error);
      setSaving(false);
    } else {
      onSaved();
    }
  }

  return (
    <div className="bg-blue-50/40 border-l-4 border-blue-500 ui-animate-in">
      <form onSubmit={save} className="px-5 py-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="ui-label">Имя</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Телефон</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="ui-input" />
            </div>
            <div>
              <label className="ui-label">Заметки</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={1}
                className="ui-textarea"
                placeholder="Опционально"
                style={{ resize: "vertical", minHeight: "40px" }}
              />
            </div>
          </div>

          {error && (
            <div className="ui-alert ui-alert-error text-xs">{error}</div>
          )}

          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="ui-btn ui-btn-primary h-9 text-xs px-4">
              {saving ? "..." : "Сохранить"}
            </button>
            <button type="button" onClick={onClose} className="ui-btn ui-btn-ghost h-9 text-xs px-4">
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGINATION
   ═══════════════════════════════════════════════════════════ */

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  // Показываем максимум 5 кнопок страниц
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pageNums = [];
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="ui-btn ui-btn-ghost text-xs h-8 px-3 disabled:opacity-30"
      >
        ←
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className="ui-btn ui-btn-ghost text-xs h-8 w-8">
            1
          </button>
          {start > 2 && <span className="text-gray-300 px-1">…</span>}
        </>
      )}

      {pageNums.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`ui-btn text-xs h-8 w-8 ${p === page ? "ui-btn-primary" : "ui-btn-ghost"}`}
        >
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="text-gray-300 px-1">…</span>}
          <button onClick={() => onChange(pages)} className="ui-btn ui-btn-ghost text-xs h-8 w-8">
            {pages}
          </button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="ui-btn ui-btn-ghost text-xs h-8 px-3 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
}
