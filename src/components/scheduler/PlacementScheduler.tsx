import React, { useState } from 'react';
import {
  Network,
  Server,
  ArrowRightLeft,
  Cpu,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Move,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PlacementScheduler: React.FC = () => {
  const { nodes, servers, migrateServerAsync, t } = useApp();
  const [draggedServerId, setDraggedServerId] = useState<string | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  const handleDragStart = (serverId: string) => {
    setDraggedServerId(serverId);
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    setTargetNodeId(nodeId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedServerId && targetId) {
      const srv = servers.find((s) => s.id === draggedServerId);
      if (srv && srv.node_id !== targetId) {
        migrateServerAsync(draggedServerId, targetId);
      }
    }
    setDraggedServerId(null);
    setTargetNodeId(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Network className="w-6 h-6 text-teal-400" />
            <span>{t.nav_scheduler}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Zero Downtime Migration
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Візуальний інтерфейс балансування навантаження: перетягуйте сервери між нодами з
            автоматичною перевіркою залишкових ресурсів
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Move className="w-3.5 h-3.5 text-teal-400" />
          <span>Підтримка Drag &amp; Drop</span>
        </div>
      </div>

      {/* Nodes Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {nodes.map((node) => {
          const nodeServers = servers.filter((s) => s.node_id === node.id);
          const totalAllocatedRamMb = nodeServers.reduce((acc, s) => acc + s.limits.ram_mb, 0);
          const totalAllocatedCpu = nodeServers.reduce((acc, s) => acc + s.limits.cpu_percent, 0);
          const ramCapacityPercent = Math.min(
            100,
            Math.round((totalAllocatedRamMb / node.ram_total_mb) * 100)
          );
          const isDragTarget = targetNodeId === node.id;

          return (
            <div
              key={node.id}
              onDragOver={(e) => handleDragOver(e, node.id)}
              onDrop={(e) => handleDrop(e, node.id)}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all min-h-[500px] ${
                isDragTarget
                  ? 'border-teal-400 ring-2 ring-teal-400/30 bg-slate-900/90 shadow-2xl'
                  : 'border-slate-800'
              }`}
            >
              {/* Node Card Header */}
              <div className="space-y-3 pb-3 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{node.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400">{node.region}</div>
                  </div>
                  {node.maintenance_mode ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Maint
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Online
                    </span>
                  )}
                </div>

                {/* Capacity Meters */}
                <div className="space-y-2 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-cyan-400" />
                        RAM Квота:
                      </span>
                      <span className="text-slate-200 font-bold">
                        {(totalAllocatedRamMb / 1024).toFixed(0)} /{' '}
                        {(node.ram_total_mb / 1024).toFixed(0)} GB ({ramCapacityPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ramCapacityPercent > 90
                            ? 'bg-rose-500'
                            : ramCapacityPercent > 75
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${ramCapacityPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        CPU Квота:
                      </span>
                      <span className="text-slate-200">
                        {totalAllocatedCpu}% ({node.cpu_cores * 100}% max)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servers list in this Node */}
              <div className="flex-1 py-3 space-y-2.5 overflow-y-auto">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Розміщено серверів ({nodeServers.length})</span>
                </div>

                {nodeServers.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 text-center p-4">
                    Перетягніть сюди сервер для міграції
                  </div>
                ) : (
                  nodeServers.map((srv) => (
                    <div
                      key={srv.id}
                      draggable
                      onDragStart={() => handleDragStart(srv.id)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-grab active:cursor-grabbing transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <Move className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0" />
                            <span className="truncate">{srv.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {srv.game}
                          </div>
                        </div>

                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            srv.status === 'running' ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                        <span>{(srv.limits.ram_mb / 1024).toFixed(0)} GB RAM</span>
                        <span>{srv.limits.cpu_percent}% CPU</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Node footer note */}
              <div className="pt-2 text-[10px] font-mono text-slate-400 text-center border-t border-slate-800">
                <span>Вільна ємність: </span>
                <span className="text-teal-400 font-semibold">
                  {Math.max(0, Math.round((node.ram_total_mb - totalAllocatedRamMb) / 1024))} GB RAM
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
