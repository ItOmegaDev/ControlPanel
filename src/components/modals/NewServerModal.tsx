import React, { useState } from 'react';
import { Server, X, Cpu, HardDrive, ShoppingBag, Activity, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NewServerModal: React.FC = () => {
  const { newServerModalOpen, setNewServerModalOpen, eggs, nodes, createServer, setSelectedServerId } = useApp();

  const [name, setName] = useState('');
  const [selectedEggId, setSelectedEggId] = useState(eggs[0]?.id || 'egg_minecraft_paper');
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0]?.id || 'node_fra_01');
  const [ramGb, setRamGb] = useState(8);
  const [cpuCores, setCpuCores] = useState(4);
  const [diskGb, setDiskGb] = useState(40);

  if (!newServerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const egg = eggs.find((item) => item.id === selectedEggId);
    const created = createServer({
      name: name.trim(),
      egg_id: selectedEggId,
      game: egg?.game || 'Minecraft: Java Edition',
      game_icon: egg?.icon || 'Pickaxe',
      node_id: selectedNodeId,
      limits: {
        cpu_percent: cpuCores * 100,
        ram_mb: ramGb * 1024,
        disk_mb: diskGb * 1024,
        io_priority: 500,
        swap_mb: 2048,
      },
    });

    setNewServerModalOpen(false);
    setSelectedServerId(created.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Розгорнути новий ігровий сервер</h2>
              <p className="text-[11px] text-slate-400">Асинхронний пайплайн створення контейнера</p>
            </div>
          </div>
          <button
            onClick={() => setNewServerModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Server Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Назва сервера (Display Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kyiv Survival SMP [1.21.4]"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Egg Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Шаблон гри (Egg Template)
            </label>
            <select
              value={selectedEggId}
              onChange={(e) => setSelectedEggId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {eggs.map((egg) => (
                <option key={egg.id} value={egg.id}>
                  {egg.name} ({egg.game}) • {egg.docker_image}
                </option>
              ))}
            </select>
          </div>

          {/* Target Node Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Цільова нода розміщення (Host Node)
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id} disabled={node.maintenance_mode}>
                  {node.name} ({node.region}) {node.maintenance_mode ? '[MAINTENANCE]' : ''} • Завантаження:{' '}
                  {node.cpu_usage_percent}%
                </option>
              ))}
            </select>
          </div>

          {/* Resource Sliders */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-200">Виділення ресурсів:</div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Пам&apos;ять (RAM)</span>
                <span className="font-mono text-emerald-400 font-bold">{ramGb} GB</span>
              </div>
              <input
                type="range"
                min={2}
                max={32}
                step={2}
                value={ramGb}
                onChange={(e) => setRamGb(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Процесорні ядра (vCPU)</span>
                <span className="font-mono text-emerald-400 font-bold">{cpuCores} Cores ({cpuCores * 100}%)</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={cpuCores}
                onChange={(e) => setCpuCores(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>NVMe Сховище (Диск)</span>
                <span className="font-mono text-emerald-400 font-bold">{diskGb} GB</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={10}
                value={diskGb}
                onChange={(e) => setDiskGb(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Сервер буде створено в ізольованій Docker-мережі без доступу до root-прав системи
              (Rootless mode).
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setNewServerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20"
            >
              Створити та запустити в Horizon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
