"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";
import StatusCounters from "@/components/StatusCounters";
import SettingsForm from "@/components/SettingsForm";
import ClearDatabaseButton from "@/components/ClearDatabaseButton";
import { Status } from "@prisma/client";

interface Client { id: number; name: string; phone: string; notes: string; status: Status; createdAt: string; }

export default function Home() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [counts, setCounts] = useState({ NEW: 0, IN_PROGRESS: 0, CLOSED: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 20;

  // Читаем URL при загрузке
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("status");
    if (s && ["NEW", "IN_PROGRESS", "CLOSED"].includes(s)) {
      setStatusFilter(s);
    }
  }, []);

  const handleStatusChange = useCallback((status: string | null) => {
    setStatusFilter(status);
    setPage(1);
    // Обновляем URL без перезагрузки
    const url = status ? `/?status=${status}` : "/";
    window.history.pushState(null, "", url);
  }, []);

  const refresh = useCallback(async (p = 1) => {
    const [c, n] = await Promise.all([api.getClients(statusFilter || undefined, p, limit), api.getCounts()]);
    setClients(c.clients); setTotal(c.total); setPages(c.pages); setPage(c.page);
    setCounts(n); setLoading(false);
  }, [statusFilter]);

  useEffect(() => { setLoading(true); refresh(1); }, [statusFilter]);

  const title = statusFilter === "NEW" ? "Новые" : statusFilter === "IN_PROGRESS" ? "В работе" : statusFilter === "CLOSED" ? "Закрытые" : "Все клиенты";

  return (
    <main className="min-h-screen" style={{ background: "var(--c-gray-50)" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚖️</span>
            <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">Client Tracker</h1>
          </div>
          <span className="text-xs font-medium text-gray-400 tabular-nums">{total} клиентов</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        <StatusCounters counts={counts} activeStatus={statusFilter} onStatusChange={handleStatusChange} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            <ClientForm onCreated={() => refresh(page)} />
            <SettingsForm key={refreshKey} />
            <ClearDatabaseButton onCleared={() => { refresh(1); setRefreshKey(k => k + 1); }} />
          </aside>

          {/* Main */}
          <section className="lg:col-span-8 flex flex-col gap-3">
            <div className="ui-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
                {statusFilter && (
                  <button onClick={() => handleStatusChange(null)} className="ui-btn ui-btn-ghost text-xs h-8">
                    Показать все →
                  </button>
                )}
              </div>
              <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : "opacity-100"}`}>
                {!loading && clients.length === 0 ? (
                  <div className="p-16 text-center">
                    <p className="text-4xl mb-2 opacity-20">📭</p>
                    <p className="text-sm text-gray-400 font-medium">Клиентов пока нет</p>
                    <p className="text-xs text-gray-300 mt-1">Добавьте первого клиента</p>
                  </div>
                ) : (
                  <ClientTable clients={clients} onChanged={() => refresh(page)} page={page} pages={pages} onPageChange={(p) => refresh(p)} />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
