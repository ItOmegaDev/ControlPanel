import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ArrowRight,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';

export const AuditLogs: React.FC = () => {
  const { auditLogs, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    const matchesAction = selectedAction === 'all' || log.action.startsWith(selectedAction);
    return matchesSearch && matchesAction;
  });

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `controlpanel_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'TargetType', 'TargetID', 'IP', 'Via'];
    const rows = auditLogs.map((l) => [
      l.created_at,
      l.actor_email,
      l.action,
      l.entity_type,
      l.entity_id,
      l.ip,
      `"${l.via}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `controlpanel_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>{t.nav_audit}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Immutable Log
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Незмінний аудит-трейл усіх операцій: хто, коли, з якої IP-адреси та які параметри було змінено
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Експорт CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Експорт JSON</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за email, IP-адресою чи типом дії..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Усі категорії дій</option>
          <option value="server">Сервери (server:*)</option>
          <option value="node">Ноди (node:*)</option>
          <option value="auth">Безпека та автентифікація (auth:*)</option>
          <option value="user">Користувачі (user:*)</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
            <tr>
              <th className="p-3.5">Час (UTC)</th>
              <th className="p-3.5">Користувач</th>
              <th className="p-3.5">Дія</th>
              <th className="p-3.5">Цільовий об&apos;єкт</th>
              <th className="p-3.5">IP-адреса</th>
              <th className="p-3.5 text-right">Зміни (Diff)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedEntry(log)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="p-3.5 text-slate-400">{log.created_at.replace('T', ' ').slice(0, 19)}</td>
                <td className="p-3.5 font-sans font-medium text-white">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.actor_email}</span>
                  </div>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      log.action.includes('delete') || log.action.includes('kill')
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : log.action.includes('create')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-3.5 text-slate-300">
                  {log.entity_type}: {log.entity_name} ({log.entity_id})
                </td>
                <td className="p-3.5 text-slate-400">{log.ip}</td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(log);
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Переглянути
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diff Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Деталі аудиту: {selectedEntry.action}</span>
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Виконавець: {selectedEntry.actor_name} ({selectedEntry.actor_email}) • IP: {selectedEntry.ip}
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Закрити
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400">Канал запиту (Via): </span>
                <span className="text-emerald-400 font-bold">{selectedEntry.via}</span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-slate-400 text-[11px] mb-1 font-bold">Зміни властивостей (Audit Diff):</div>
                {selectedEntry.diff && selectedEntry.diff.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEntry.diff.map((d, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="text-slate-300 font-bold">Поле: {d.field}</div>
                        <div className="text-rose-400">Старе значення: {JSON.stringify(d.old_value)}</div>
                        <div className="text-emerald-400">Нове значення: {JSON.stringify(d.new_value)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500">
                    Немає зафіксованих змін полів.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
