import React, { useState } from 'react';
import {
  Server as ServerIcon,
  Play,
  RotateCw,
  Square,
  Search,
  Filter,
  Layers,
  Tag,
  ArrowRightLeft,
  Sliders,
  Shield,
  Clock,
  Users,
  HardDrive,
  Cpu,
  Plus,
  LayoutGrid,
  List,
  CheckSquare,
  Square as SquareEmpty,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Server, ServerStatus } from '../../types';

export const ServerList: React.FC = () => {
  const {
    servers,
    nodes,
    setSelectedServerId,
    updateServerStatus,
    bulkMigrateServers,
    bulkChangeStatus,
    bulkAssignTag,
    setNewServerModalOpen,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [bulkMigrateTarget, setBulkMigrateTarget] = useState<string>(nodes[0]?.id || '');
  const [bulkMenuOpen, setBulkMenuOpen] = useState<'migrate' | 'tag' | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(servers.flatMap((s) => s.tags)));

  // Filtered servers
  const filteredServers = servers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.uuid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || s.tags.includes(selectedTag);
    const matchesNode = selectedNode === 'all' || s.node_id === selectedNode;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesTag && matchesNode && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedServerIds.length === filteredServers.length) {
      setSelectedServerIds([]);
    } else {
      setSelectedServerIds(filteredServers.map((s) => s.id));
    }
  };

  const toggleSelectServer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedServerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const formatUptime = (seconds: number) => {
    if (seconds <= 0) return '0m';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getStatusBadge = (status: ServerStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t.status_running}
          </span>
        );
      case 'starting':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <RotateCw className="w-2.5 h-2.5 animate-spin" />
            {t.status_starting}
          </span>
        );
      case 'stopping':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {t.status_stopping}
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {t.status_suspended}
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            {t.status_offline}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ServerIcon className="w-6 h-6 text-emerald-400" />
            <span>{t.nav_servers}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filteredServers.length} активних
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ізольовані rootless Docker-контейнери з автоматичним балансуванням на нодах
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Сітка"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Таблиця"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setNewServerModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.action_new_server}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою, грою або UUID..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Усі теги ({allTags.length})</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                Тег: {tag}
              </option>
            ))}
          </select>

          {/* Node Filter */}
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Усі ноди ({nodes.length})</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Нода: {node.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Усі статуси</option>
            <option value="running">Працює</option>
            <option value="offline">Вимкнено</option>
            <option value="suspended">Призупинено</option>
          </select>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            {selectedServerIds.length === filteredServers.length && filteredServers.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <SquareEmpty className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">Вибрати всі</span>
          </button>
        </div>
      </div>

      {/* BULK ACTIONS BAR (Visible when servers are selected) - Section 3.2 */}
      {selectedServerIds.length > 0 && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-xs">
              {selectedServerIds.length}
            </span>
            <span className="text-xs font-semibold text-emerald-200">
              Вибрано серверів для групової дії (Bulk Operations):
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Start */}
            <button
              onClick={() => bulkChangeStatus(selectedServerIds, 'running')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Запустити</span>
            </button>

            {/* Bulk Restart */}
            <button
              onClick={() => bulkChangeStatus(selectedServerIds, 'starting')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Перезапустити</span>
            </button>

            {/* Bulk Stop */}
            <button
              onClick={() => bulkChangeStatus(selectedServerIds, 'offline')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Зупинити</span>
            </button>

            {/* Bulk Tag assignment */}
            <div className="relative">
              <button
                onClick={() => setBulkMenuOpen(bulkMenuOpen === 'tag' ? null : 'tag')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Призначити тег</span>
              </button>

              {bulkMenuOpen === 'tag' && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-40 space-y-2">
                  <div className="text-[11px] font-medium text-slate-300">
                    Додати мітку до вибраних серверів:
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={bulkTagInput}
                      onChange={(e) => setBulkTagInput(e.target.value)}
                      placeholder="e.g. migration-2026, vip"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (bulkTagInput.trim()) {
                          bulkAssignTag(selectedServerIds, bulkTagInput.trim());
                          setBulkTagInput('');
                          setBulkMenuOpen(null);
                        }
                      }}
                      className="bg-emerald-500 text-black px-2.5 py-1 rounded text-xs font-bold hover:bg-emerald-400"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Migration to another node */}
            <div className="relative">
              <button
                onClick={() => setBulkMenuOpen(bulkMenuOpen === 'migrate' ? null : 'migrate')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-medium"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Масовий перенос на ноду</span>
              </button>

              {bulkMenuOpen === 'migrate' && (
                <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-40 space-y-2">
                  <div className="text-[11px] font-medium text-slate-300">
                    Перенести {selectedServerIds.length} серверів у черзі Horizon:
                  </div>
                  <select
                    value={bulkMigrateTarget}
                    onChange={(e) => setBulkMigrateTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.region})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      bulkMigrateServers(selectedServerIds, bulkMigrateTarget);
                      setSelectedServerIds([]);
                      setBulkMenuOpen(null);
                    }}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Розпочати асинхронний перенос
                  </button>
                </div>
              )}
            </div>

            {/* Clear selection */}
            <button
              onClick={() => setSelectedServerIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server) => {
            const node = nodes.find((n) => n.id === server.node_id);
            const isSelected = selectedServerIds.includes(server.id);
            const cpuUsage = server.current_stats.cpu_percent;
            const ramUsageMb = server.current_stats.ram_mb;
            const ramPercent = Math.min(
              100,
              Math.round((ramUsageMb / server.limits.ram_mb) * 100)
            );

            return (
              <div
                key={server.id}
                onClick={() => setSelectedServerId(server.id)}
                className={`bg-slate-900/90 border rounded-2xl p-4.5 cursor-pointer transition-all relative overflow-hidden group hover:shadow-xl hover:border-slate-700 ${
                  isSelected
                    ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Header row: select checkbox, name & status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={(e) => toggleSelectServer(server.id, e)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <SquareEmpty className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {server.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <span className="truncate">{server.game}</span>
                        <span>•</span>
                        <span className="text-slate-500">{node?.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">{getStatusBadge(server.status)}</div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                  {server.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {server.network_isolated && (
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      title="Ізольована Docker-мережа"
                    >
                      Net-Isolated
                    </span>
                  )}
                </div>

                {/* Metrics Progress bars */}
                <div className="space-y-2 py-2 border-t border-b border-slate-800/80 my-2.5 text-[11px] font-mono">
                  {/* CPU Meter */}
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span>CPU</span>
                      </span>
                      <span className="text-slate-200">
                        {cpuUsage}% / {server.limits.cpu_percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cpuUsage > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (cpuUsage / server.limits.cpu_percent) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* RAM Meter */}
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-cyan-400" />
                        <span>RAM</span>
                      </span>
                      <span className="text-slate-200">
                        {(ramUsageMb / 1024).toFixed(1)} GB /{' '}
                        {(server.limits.ram_mb / 1024).toFixed(0)} GB ({ramPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ramPercent > 90 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${ramPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Info & Power Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1" title="Гравці онлайн">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {server.current_stats.players_online}/{server.current_stats.players_max}
                      </span>
                    </span>
                    <span className="flex items-center gap-1" title="Аптайм">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatUptime(server.current_stats.uptime_seconds)}</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {server.status === 'offline' ? (
                      <button
                        onClick={() => updateServerStatus(server.id, 'running')}
                        className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black transition-colors"
                        title={t.action_start}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => updateServerStatus(server.id, 'starting')}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black transition-colors"
                          title={t.action_restart}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateServerStatus(server.id, 'offline')}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
                          title={t.action_stop}
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-10">
                  <button onClick={handleSelectAll}>
                    {selectedServerIds.length === filteredServers.length &&
                    filteredServers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <SquareEmpty className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Назва & Гра</th>
                <th className="p-3.5">Статус</th>
                <th className="p-3.5">Нода</th>
                <th className="p-3.5">CPU</th>
                <th className="p-3.5">RAM</th>
                <th className="p-3.5">Гравці</th>
                <th className="p-3.5">Аптайм</th>
                <th className="p-3.5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredServers.map((server) => {
                const node = nodes.find((n) => n.id === server.node_id);
                const isSelected = selectedServerIds.includes(server.id);
                return (
                  <tr
                    key={server.id}
                    onClick={() => setSelectedServerId(server.id)}
                    className={`cursor-pointer hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => toggleSelectServer(server.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <SquareEmpty className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <div className="font-sans font-bold text-white">{server.name}</div>
                      <div className="text-[11px] text-slate-400">{server.game}</div>
                    </td>
                    <td className="p-3.5">{getStatusBadge(server.status)}</td>
                    <td className="p-3.5 text-slate-300">{node?.name}</td>
                    <td className="p-3.5 text-slate-300">
                      {server.current_stats.cpu_percent}% / {server.limits.cpu_percent}%
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {(server.current_stats.ram_mb / 1024).toFixed(1)} /{' '}
                      {(server.limits.ram_mb / 1024).toFixed(0)} GB
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {server.current_stats.players_online}/{server.current_stats.players_max}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {formatUptime(server.current_stats.uptime_seconds)}
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {server.status === 'offline' ? (
                          <button
                            onClick={() => updateServerStatus(server.id, 'running')}
                            className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black"
                            title={t.action_start}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => updateServerStatus(server.id, 'starting')}
                              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black"
                              title={t.action_restart}
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateServerStatus(server.id, 'offline')}
                              className="p-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white"
                              title={t.action_stop}
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
