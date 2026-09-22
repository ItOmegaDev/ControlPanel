import React, { useState, useEffect, useRef } from 'react';
import {
  Server as ServerIcon,
  Play,
  RotateCw,
  Square,
  Flame,
  Terminal,
  Activity,
  FolderTree,
  Network,
  Archive,
  History,
  Users,
  Settings,
  ArrowLeft,
  Copy,
  Check,
  Send,
  Trash2,
  Download,
  Upload,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Cpu,
  Radio,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Server, ServerStatus, ServerLimits, ServerBackup, ServerSnapshot, FileItem } from '../../types';

export const ServerDetail: React.FC = () => {
  const {
    selectedServerId,
    setSelectedServerId,
    servers,
    nodes,
    updateServerStatus,
    updateServerLimits,
    deleteServer,
    t,
  } = useApp();

  const server = servers.find((s) => s.id === selectedServerId);
  const node = nodes.find((n) => n.id === server?.node_id);

  const [activeSubTab, setActiveSubTab] = useState<
    'console' | 'metrics' | 'files' | 'network' | 'backups' | 'snapshots' | 'team' | 'settings'
  >('console');

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[ControlPanel NodeAgent] Container initialized with rootless user-namespace (UID: 10001, GID: 10001)',
    '[ControlPanel NodeAgent] Isolated bridge network attached: cp_net_bridge_991',
    '[System] Allocating 16384 MB memory with jemalloc allocator...',
    '[ServerEngine] Loading environment variables from PostgreSQL JSONB config...',
    '[ServerEngine] Container starting up with entrypoint command...',
    '[ServerEngine] Listening for incoming players on 0.0.0.0:25565',
    '[Metrics] Heartbeat OK: 64.2% CPU, 11420 MB RAM, 0 crashed threads',
    '[ControlPanel] WebSocket binary stream connected (latency: 18ms)',
  ]);
  const [commandInput, setCommandInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // File Manager state
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<FileItem[]>([
    { name: 'server.properties', path: '/server.properties', is_dir: false, size_bytes: 1420, modified_at: '2026-03-22 17:10', permissions: 'rw-r--r--' },
    { name: 'paper-global.yml', path: '/paper-global.yml', is_dir: false, size_bytes: 8410, modified_at: '2026-03-21 14:02', permissions: 'rw-r--r--' },
    { name: 'config.json', path: '/config.json', is_dir: false, size_bytes: 2048, modified_at: '2026-03-22 09:15', permissions: 'rw-r--r--' },
    { name: 'plugins', path: '/plugins', is_dir: true, size_bytes: 4096, modified_at: '2026-03-20 18:30', permissions: 'rwxr-xr-x' },
    { name: 'world', path: '/world', is_dir: true, size_bytes: 4096, modified_at: '2026-03-22 18:35', permissions: 'rwxr-xr-x' },
    { name: 'logs', path: '/logs', is_dir: true, size_bytes: 4096, modified_at: '2026-03-22 18:40', permissions: 'rwxr-xr-x' },
  ]);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  // Backups state
  const [backups, setBackups] = useState<ServerBackup[]>([
    {
      id: 'bup_101',
      server_id: server?.id || '',
      name: 'Pre-update full snapshot',
      size_mb: 4210,
      storage_driver: 's3_minio',
      checksum_sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      status: 'completed',
      created_at: '2026-03-21 03:00',
    },
    {
      id: 'bup_102',
      server_id: server?.id || '',
      name: 'Nightly World Backup',
      size_mb: 3980,
      storage_driver: 'local',
      checksum_sha256: 'e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      status: 'completed',
      created_at: '2026-03-20 03:00',
    },
  ]);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<ServerSnapshot[]>([
    {
      id: 'snap_01',
      server_id: server?.id || '',
      name: 'Initial 16GB High-tick profile',
      limits: server?.limits || { cpu_percent: 400, ram_mb: 16384, disk_mb: 61440, io_priority: 500, swap_mb: 2048 },
      startup_command: server?.startup_command || '',
      created_at: '2026-03-10 14:00',
    },
  ]);

  // Settings limits form
  const [limitsForm, setLimitsForm] = useState<ServerLimits>(
    server?.limits || { cpu_percent: 400, ram_mb: 16384, disk_mb: 61440, io_priority: 500, swap_mb: 2048 }
  );
  const [limitsSaved, setLimitsSaved] = useState(false);

  // Sub-users / Team access
  const [subUsers, setSubUsers] = useState([
    { email: 'danilo.moderator@smp.gg', role: 'Operator', permissions: ['console:interact', 'server:restart', 'files:read'] },
    { email: 'dev.artem@smp.gg', role: 'Developer', permissions: ['console:interact', 'server:power', 'files:write', 'backups:manage'] },
  ]);
  const [newSubUserEmail, setNewSubUserEmail] = useState('');

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  if (!server) {
    return (
      <div className="p-12 text-center text-slate-400">
        Сервер не знайдено.{' '}
        <button
          onClick={() => setSelectedServerId(null)}
          className="text-emerald-400 underline font-medium"
        >
          Повернутися до списку
        </button>
      </div>
    );
  }

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const cmd = commandInput.trim();
    setTerminalLogs((prev) => [
      ...prev,
      `> ${cmd}`,
      `[Server Console] Executing command: '${cmd}' (Operator: web-admin)`,
    ]);
    setCommandInput('');
  };

  const handleOpenFile = (f: FileItem) => {
    if (f.is_dir) return;
    setEditingFile(f);
    if (f.name === 'server.properties') {
      setFileContent(
        `# Minecraft server properties\n# Generated by ControlPanel Agent (v1.22)\nmotd=Kyiv Craft SMP 1.21.4 - Welcome!\nserver-port=25565\nmax-players=100\nonline-mode=true\npvp=true\ndifficulty=hard\nview-distance=12\nnetwork-compression-threshold=256\nenable-rcon=false\nsync-chunk-writes=true`
      );
    } else if (f.name === 'config.json') {
      setFileContent(
        JSON.stringify(
          {
            server_name: server.name,
            version: '1.21.4',
            auto_backup: true,
            max_memory_mb: server.limits.ram_mb,
            optimization: {
              aikars_flags: true,
              jemalloc: true,
              async_chunks: true,
            },
          },
          null,
          2
        )
      );
    } else {
      setFileContent(`// ${f.name}\n// Config file for ${server.name}\n// Ready for editing`);
    }
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    updateServerLimits(server.id, limitsForm);
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 2000);
  };

  const handleCreateBackup = () => {
    const newBup: ServerBackup = {
      id: `bup_${Date.now()}`,
      server_id: server.id,
      name: `Manual backup (${new Date().toLocaleTimeString()})`,
      size_mb: Math.round(server.current_stats.disk_mb / 1024 * 10) / 10,
      storage_driver: 's3_minio',
      checksum_sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      status: 'completed',
      created_at: new Date().toLocaleString(),
    };
    setBackups([newBup, ...backups]);
  };

  const handleCreateSnapshot = () => {
    const snap: ServerSnapshot = {
      id: `snap_${Date.now()}`,
      server_id: server.id,
      name: `Snapshot: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      limits: { ...server.limits },
      startup_command: server.startup_command,
      created_at: new Date().toLocaleString(),
    };
    setSnapshots([snap, ...snapshots]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Breadcrumb & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedServerId(null)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Назад до всіх серверів"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {server.name}
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {server.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
              <span>UUID: {server.uuid.slice(0, 8)}...</span>
              <span>•</span>
              <span className="text-emerald-400">{node?.name}</span>
              <span>•</span>
              <span>Docker Rootless</span>
            </div>
          </div>
        </div>

        {/* Server Power Controls */}
        <div className="flex items-center gap-1.5 self-end md:self-center">
          <button
            onClick={() => updateServerStatus(server.id, 'running')}
            disabled={server.status === 'running'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.action_start}</span>
          </button>

          <button
            onClick={() => updateServerStatus(server.id, 'starting')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/30 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t.action_restart}</span>
          </button>

          <button
            onClick={() => updateServerStatus(server.id, 'offline')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{t.action_stop}</span>
          </button>

          <button
            onClick={() => updateServerStatus(server.id, 'offline')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 transition-colors"
            title="Примусово надіслати SIGKILL процесу"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kill</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 pb-1 scrollbar-none">
        {[
          { id: 'console', label: t.tab_console, icon: Terminal },
          { id: 'metrics', label: t.tab_metrics, icon: Activity },
          { id: 'files', label: t.tab_files, icon: FolderTree },
          { id: 'network', label: t.tab_network, icon: Network },
          { id: 'backups', label: t.tab_backups, icon: Archive },
          { id: 'snapshots', label: t.tab_snapshots, icon: History },
          { id: 'team', label: t.tab_team, icon: Users },
          { id: 'settings', label: t.tab_settings, icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: CONSOLE & TERMINAL */}
      {activeSubTab === 'console' && (
        <div className="space-y-3">
          {/* Quick status bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[11px] mb-1">Завантаження CPU</div>
              <div className="text-emerald-400 font-bold text-sm">
                {server.current_stats.cpu_percent}% / {server.limits.cpu_percent}%
              </div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[11px] mb-1">Пам&apos;ять (RAM)</div>
              <div className="text-cyan-400 font-bold text-sm">
                {(server.current_stats.ram_mb / 1024).toFixed(1)} GB / {(server.limits.ram_mb / 1024).toFixed(0)} GB
              </div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[11px] mb-1">Мережевий трафік</div>
              <div className="text-amber-400 font-bold text-sm">
                ↓ {(server.current_stats.net_rx_kb / 1024).toFixed(1)} MB • ↑ {(server.current_stats.net_tx_kb / 1024).toFixed(1)} MB
              </div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 text-[11px] mb-1">Гравці онлайн</div>
              <div className="text-indigo-400 font-bold text-sm">
                {server.current_stats.players_online} / {server.current_stats.players_max}
              </div>
            </div>
          </div>

          {/* Terminal Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Terminal Title Bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">container_pty (WebSocket binary stream)</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">18ms latency</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setTerminalLogs([])}
                  className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
                >
                  Очистити
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1 select-text">
              {terminalLogs.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.startsWith('>')
                      ? 'text-cyan-400 font-bold'
                      : line.includes('Heartbeat') || line.includes('OK')
                      ? 'text-emerald-400'
                      : line.includes('warn') || line.includes('Warn')
                      ? 'text-amber-400'
                      : line.includes('error') || line.includes('Error')
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Form */}
            <form
              onSubmit={handleSendCommand}
              className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
            >
              <span className="text-emerald-400 font-mono text-sm pl-2 font-bold">&gt;</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Введіть команду консолі (e.g. say Сервер перезавантажується, list, stop)..."
                className="flex-1 bg-transparent text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1"
              >
                <span>Надіслати</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: LIVE METRICS */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CPU & Threads */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Використання ядер CPU (Live)
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {server.current_stats.cpu_percent}%
                </span>
              </div>
              <div className="h-32 flex items-end gap-1 pt-4 pb-1">
                {[45, 52, 60, 58, 64, 70, 68, 62, 59, 64, 61, 65, 64].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/30 hover:bg-emerald-400 rounded-t transition-all"
                    style={{ height: `${v}%` }}
                    title={`${v}% load`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Ліміт: {server.limits.cpu_percent}% (4 vCPU Cores)</span>
                <span>IO Пріоритет: {server.limits.io_priority}/1000</span>
              </div>
            </div>

            {/* RAM & jemalloc */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  Оперативна пам&apos;ять (RAM Allocation)
                </span>
                <span className="font-mono text-xs text-cyan-400 font-bold">
                  {(server.current_stats.ram_mb / 1024).toFixed(1)} GB / {(server.limits.ram_mb / 1024).toFixed(0)} GB
                </span>
              </div>
              <div className="h-32 flex items-end gap-1 pt-4 pb-1">
                {[60, 62, 65, 68, 70, 71, 72, 70, 69, 71, 72, 72, 70].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/30 hover:bg-cyan-400 rounded-t transition-all"
                    style={{ height: `${v}%` }}
                    title={`${v}% RAM`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Виділено Swap: {server.limits.swap_mb} MB</span>
                <span>Native Memory Allocator: jemalloc</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FILE MANAGER */}
      {activeSubTab === 'files' && (
        <div className="space-y-3">
          {/* File Manager Toolbar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Шлях: /home/container{currentPath}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const name = prompt('Введіть назву нового файлу:');
                  if (name) {
                    setFiles([
                      ...files,
                      {
                        name,
                        path: `/${name}`,
                        is_dir: false,
                        size_bytes: 0,
                        modified_at: 'Щойно',
                        permissions: 'rw-r--r--',
                      },
                    ]);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Новий файл</span>
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Назва</th>
                  <th className="p-3">Розмір</th>
                  <th className="p-3">Змінено</th>
                  <th className="p-3">Права</th>
                  <th className="p-3 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {files.map((file) => (
                  <tr
                    key={file.name}
                    onClick={() => handleOpenFile(file)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 flex items-center gap-2.5 text-slate-200">
                      {file.is_dir ? (
                        <FolderTree className="w-4 h-4 text-amber-400" />
                      ) : (
                        <FileCode className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="font-medium hover:underline">{file.name}</span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {file.is_dir ? '-' : `${(file.size_bytes / 1024).toFixed(1)} KB`}
                    </td>
                    <td className="p-3 text-slate-400">{file.modified_at}</td>
                    <td className="p-3 text-slate-500">{file.permissions}</td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setFiles(files.filter((f) => f.name !== file.name))}
                        className="p-1 hover:text-rose-400 text-slate-500"
                        title="Видалити"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* File Editor Modal */}
          {editingFile && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[75vh] overflow-hidden">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>Редагування: {editingFile.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingFile(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Закрити
                    </button>
                    <button
                      onClick={() => {
                        setEditingFile(null);
                        showToast(`Файл ${editingFile.name} успішно збережено на ноді!`);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                    >
                      Зберегти зміни
                    </button>
                  </div>
                </div>
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full flex-1 p-4 bg-slate-950 font-mono text-xs text-emerald-300 resize-none focus:outline-none leading-relaxed selection:bg-emerald-500 selection:text-black"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: NETWORK & PORTS */}
      {activeSubTab === 'network' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                Виділені порти та мережева ізоляція (Section 3.1)
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Bridge Isolated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Кожен сервер розгортається у власній ізольованій Docker-мережі. Міжсерверний
              трафік заблокований на рівні iptables/nftables Node Agent.
            </p>

            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 mt-3">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Порт</th>
                    <th className="p-3">Протокол</th>
                    <th className="p-3">Тип</th>
                    <th className="p-3">Призначення</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {server.ports.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-emerald-400">{p.port}</td>
                      <td className="p-3 uppercase text-slate-300">{p.protocol}</td>
                      <td className="p-3">
                        {p.primary ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                            Головний (Primary)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Додатковий</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{p.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BACKUPS */}
      {activeSubTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-400" />
                Резервні копії (Backups with SHA-256 Checksums)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Асинхронна генерація копій через Horizon з відправкою на S3 MinIO або локальний диск
              </p>
            </div>
            <button
              onClick={handleCreateBackup}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Створити резервну копію</span>
            </button>
          </div>

          <div className="space-y-2">
            {backups.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{b.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {b.storage_driver}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-lg">
                    SHA256: {b.checksum_sha256}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-300">
                  <span>{b.size_mb} MB</span>
                  <span className="text-slate-500">{b.created_at}</span>
                  <button
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    title="Завантажити архів"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CONFIG SNAPSHOTS */}
      {activeSubTab === 'snapshots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                Снапшоти конфігурації (Section 3.2)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Можливість відкотити зміни лімітів ресурсів чи команди запуску
              </p>
            </div>
            <button
              onClick={handleCreateSnapshot}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Зберегти точку відкату</span>
            </button>
          </div>

          <div className="space-y-2">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <div className="font-bold text-white">{snap.name}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    CPU: {snap.limits.cpu_percent}% • RAM: {snap.limits.ram_mb} MB • Створено: {snap.created_at}
                  </div>
                </div>
                <button
                  onClick={() => {
                    updateServerLimits(server.id, snap.limits);
                    showToast('Ліміти сервера успішно відкочено до вибраного снапшота!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold"
                >
                  Відкотити налаштування
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: TEAM ACCESS */}
      {activeSubTab === 'team' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Командний доступ (Team Access - Section 3.4)
            </h3>
            <p className="text-xs text-slate-400">
              Один сервер може мати кількох адміністраторів з різними правами (перезапуск,
              файли, консоль) без передачі повного пароля від акаунту.
            </p>

            <div className="flex gap-2 pt-2">
              <input
                type="email"
                value={newSubUserEmail}
                onChange={(e) => setNewSubUserEmail(e.target.value)}
                placeholder="Введіть email колеги або модератора..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={() => {
                  if (newSubUserEmail.trim()) {
                    setSubUsers([
                      ...subUsers,
                      { email: newSubUserEmail.trim(), role: 'Operator', permissions: ['console:interact', 'server:restart'] },
                    ]);
                    setNewSubUserEmail('');
                  }
                }}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400"
              >
                Запросити до команди
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {subUsers.map((su) => (
                <div
                  key={su.email}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{su.email}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Дозволи: {su.permissions.join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => setSubUsers(subUsers.filter((u) => u.email !== su.email))}
                    className="text-rose-400 hover:text-rose-300 text-xs font-mono"
                  >
                    Відкликати доступ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS & LIMITS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveLimits} className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              Конфігурація лімітів контейнера (Docker Container Limits)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  CPU Ліміт (% від одного ядра, 400% = 4 ядра)
                </label>
                <input
                  type="number"
                  value={limitsForm.cpu_percent}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, cpu_percent: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Виділена пам&apos;ять RAM (MB)
                </label>
                <input
                  type="number"
                  value={limitsForm.ram_mb}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, ram_mb: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Дискова квота (MB)
                </label>
                <input
                  type="number"
                  value={limitsForm.disk_mb}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, disk_mb: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  I/O Пріоритет (BlockIO Weight 100-1000)
                </label>
                <input
                  type="number"
                  value={limitsForm.io_priority}
                  onChange={(e) =>
                    setLimitsForm({ ...limitsForm, io_priority: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Зберегти ліміти
              </button>
              {limitsSaved && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Ліміти успішно застосовано без перезавантаження (cgroups v2)
                </span>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-rose-300">Небезпечна зона (Danger Zone)</div>
              <p className="text-xs text-slate-400 mt-0.5">
                Видалення сервера призведе до знищення файлів контейнера на цільовій ноді.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Ви точно бажаєте видалити сервер "${server.name}"?`)) {
                  deleteServer(server.id);
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
            >
              Видалити сервер
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
