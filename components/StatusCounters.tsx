"use client";

interface Props {
  counts: { NEW: number; IN_PROGRESS: number; CLOSED: number };
  activeStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const items = [
  { key: null,          label: "Все",      icon: "📋", color: "gray",    bg: "bg-gray-100",    activeBg: "bg-gray-500",   activeText: "text-white" },
  { key: "NEW",         label: "Новые",    icon: "🆕", color: "blue",    bg: "bg-blue-50",     activeBg: "bg-blue-600",   activeText: "text-white" },
  { key: "IN_PROGRESS", label: "В работе", icon: "⚙️", color: "amber",   bg: "bg-amber-50",    activeBg: "bg-amber-600",  activeText: "text-white" },
  { key: "CLOSED",      label: "Закрытые", icon: "✅", color: "emerald", bg: "bg-emerald-50",  activeBg: "bg-emerald-600", activeText: "text-white" },
] as const;

export default function StatusCounters({ counts, activeStatus, onStatusChange }: Props) {
  const total = counts.NEW + counts.IN_PROGRESS + counts.CLOSED;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((s) => {
        const active = s.key === null ? !activeStatus : activeStatus === s.key;
        const count = s.key === null ? total : counts[s.key] ?? 0;

        return (
          <button key={s.key ?? "all"}
            onClick={() => onStatusChange(s.key)}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer
              ${active
                ? `${s.activeBg} ${s.activeText} border-transparent shadow-md`
                : `${s.bg} border-transparent hover:shadow-sm`
              }`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className={`text-sm font-medium ${active ? "opacity-80" : "text-gray-500"}`}>{s.label}</div>
              <div className={`text-2xl font-bold tabular-nums ${active ? "" : "text-gray-900"}`}>{count}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
