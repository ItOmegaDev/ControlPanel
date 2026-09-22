import React, { useState } from 'react';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Shield,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Plus,
  Bell,
  Wrench,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Node } from '../../types';

export const NodeManagement: React.FC = () => {
  const { nodes, toggleNodeMaintenance, setNewNodeModalOpen, t } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');
  const [copiedToken, setCopiedToken] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleCopyAgentToken = (token: string) => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-indigo-400" />
            <span>{t.nav_nodes} & Health Dashboard</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Go 1.22 Daemon
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Моніторинг Node Agent у реальному часі, автоматичні алерти та режим обслуговування (Maintenance mode)
          </p>
        </div>

        <button
          onClick={() => setNewNodeModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Підключити нову ноду</span>
        </button>
      </div>

      {/* Nodes Quick Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNode.id;
          const isOnline = node.status === 'online';
          const isMaint = node.maintenance_mode;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{node.name}</h3>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {node.region} ({node.country_code})
                  </div>
                </div>

                {isMaint ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Wrench className="w-2.5 h-2.5" />
                    Maint
                  </span>
                ) : isOnline ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    Offline
                  </span>
                )}
              </div>

              {/* Progress Gauges */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>CPU:</span>
                  <span className="text-slate-200">{node.cpu_usage_percent}% ({node.cpu_cores} Cores)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RAM:</span>
                  <span className="text-slate-200">
                    {(node.ram_used_mb / 1024).toFixed(0)} / {(node.ram_total_mb / 1024).toFixed(0)} GB
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Сервери:</span>
                  <span className="text-indigo-400 font-semibold">{node.servers_count} інстансів</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Health Dashboard */}
      {selectedNode && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Header of selected node */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white">{selectedNode.name}</h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {selectedNode.fqdn} ({selectedNode.ip})
                </span>
                {selectedNode.is_rootless && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Rootless {selectedNode.daemon_type}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 font-mono mt-1">
                <span>Agent: {selectedNode.agent_version}</span>
                <span>•</span>
                <span>Latency: {selectedNode.latency_ms} ms</span>
                <span>•</span>
                <span>Аптайм ноди: {selectedNode.uptime_days} днів</span>
              </div>
            </div>

            {/* Maintenance Mode Toggle Switch */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Режим обслуговування (Maintenance Mode)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Забороняє створення нових серверів на ноді
                </div>
              </div>
              <button
                onClick={() => toggleNodeMaintenance(selectedNode.id)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedNode.maintenance_mode
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {selectedNode.maintenance_mode ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}
              </button>
            </div>
          </div>

          {/* Real-time Health Metrics Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CPU */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  CPU Load
                </span>
                <span className="text-emerald-400 font-bold">{selectedNode.cpu_usage_percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${selectedNode.cpu_usage_percent}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                {selectedNode.cpu_cores} Physical/Logical Cores Active
              </div>
            </div>

            {/* RAM */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  RAM Usage
                </span>
                <span className="text-cyan-400 font-bold">
                  {(selectedNode.ram_used_mb / 1024).toFixed(0)} / {(selectedNode.ram_total_mb / 1024).toFixed(0)} GB
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{
                    width: `${(selectedNode.ram_used_mb / selectedNode.ram_total_mb) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                ECC DDR5 Registered Memory
              </div>
            </div>

            {/* Disk */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  NVMe Storage
                </span>
                <span className="text-amber-400 font-bold">
                  {selectedNode.disk_used_gb} / {selectedNode.disk_total_gb} GB
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${(selectedNode.disk_used_gb / selectedNode.disk_total_gb) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                ZFS / Btrfs mirror with automated scrubbing
              </div>
            </div>
          </div>

          {/* 30-day History & Alert configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Historical uptime chart */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Історія доступності за 30 днів (Prometheus Metrics)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">99.98% аптайм</span>
              </div>
              <div className="flex items-center gap-1 pt-2">
                {Array.from({ length: 30 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-8 rounded-sm bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
                    title={`День ${30 - idx}: 100% доступність`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>30 днів тому</span>
                <span>Сьогодні</span>
              </div>
            </div>

            {/* Alert Rules */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Автоматичні алерти ноди (Section 3.3)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Discord & Email Hooks</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">Алерт при заповненні диска &gt; 90%</span>
                  <span className="text-emerald-400 font-mono text-[11px]">✓ Активовано</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">Сповіщення при падінні з&apos;єднання з Node Agent (&gt;15s)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">✓ Webhook</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Agent Token & Installation Helper */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Секретний токен агента (HMAC Authentication)
              </span>
              <button
                onClick={() => handleCopyAgentToken(selectedNode.agent_token)}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3 h-3" />
                    Скопійовано
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Скопіювати токен
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-indigo-300 border border-slate-800 select-all">
              {selectedNode.agent_token}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
