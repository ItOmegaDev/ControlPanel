import React, { useState } from 'react';
import {
  ShoppingBag,
  Download,
  Star,
  RefreshCw,
  Layers,
  CheckCircle,
  FileCode,
  HardDrive,
  GitCompare,
  Search,
  Check,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Egg } from '../../types';

export const EggMarketplace: React.FC = () => {
  const { eggs, t, setNewServerModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [diffEgg, setDiffEgg] = useState<Egg | null>(null);
  const [installedEggIds, setInstalledEggIds] = useState<string[]>(['egg_minecraft_paper', 'egg_cs2']);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const filteredEggs = eggs.filter((egg) => {
    const matchesSearch =
      egg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      egg.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      egg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'official' && egg.official) ||
      (selectedCategory === 'steamcmd' && egg.category === 'games') ||
      egg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstallEgg = (id: string) => {
    if (!installedEggIds.includes(id)) {
      setInstalledEggIds([...installedEggIds, id]);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>{t.nav_marketplace}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Community &amp; Verified
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Встановлюйте офіційні та ком&apos;юніті-шаблони в 1 клік, відстежуйте diff оновлень та кеш
            SteamCMD на нодах
          </p>
        </div>

        {/* SteamCMD Node Cache Status Indicator */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <div className="text-xs font-mono">
            <div className="text-slate-300 font-semibold">SteamCMD Shared Cache</div>
            <div className="text-[11px] text-emerald-400">142.6 GB спільних файлів на нодах</div>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук гри або шаблону (Minecraft, CS2, Rust, Palworld)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'official', 'steamcmd'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'Всі шаблони' : cat === 'official' ? 'Офіційні' : 'SteamCMD'}
            </button>
          ))}
        </div>
      </div>

      {/* Eggs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEggs.map((egg) => {
          const isInstalled = installedEggIds.includes(egg.id);

          return (
            <div
              key={egg.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{egg.name}</span>
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{egg.game}</div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{egg.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{egg.description}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {egg.official && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Офіційний образ
                    </span>
                  )}
                  {egg.category === 'games' && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      SteamCMD / Dedicated
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    v{egg.version}
                  </span>
                </div>

                {/* Docker image */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 truncate">
                  <span className="text-slate-500">Image: </span>
                  <span className="text-amber-300">{egg.docker_image}</span>
                </div>

                {/* Update Available notification */}
                {egg.rating > 4.85 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <span className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      Підтримує автооновлення
                    </span>
                    <button
                      onClick={() => setDiffEgg(egg)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      <GitCompare className="w-3 h-3" />
                      Diff змін
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setDiffEgg(egg)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-400" />
                  <span>Змінні ({egg.variables.length})</span>
                </button>

                {isInstalled ? (
                  <button
                    onClick={() => setNewServerModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Створити сервер</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstallEgg(egg.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Встановити Egg</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diff / Schema Modal */}
      {diffEgg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-amber-400" />
                  Схема та Diff оновлень: {diffEgg.name}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Docker Image: {diffEgg.docker_image}
                </div>
              </div>
              <button
                onClick={() => setDiffEgg(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Закрити
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="text-xs text-slate-300">
                Змінні конфігурації у форматі <strong>PostgreSQL JSONB</strong> з підтримкою типів
                select, boolean, range та encrypted secrets:
              </div>

              <div className="space-y-3">
                {diffEgg.variables.map((v) => (
                  <div
                    key={v.key}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">{v.key}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {v.rules}
                      </span>
                    </div>
                    <div className="text-slate-200 font-sans text-xs">{v.name}</div>
                    <div className="text-[11px] text-slate-400 font-sans">{v.description}</div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      За замовчуванням: <span className="text-amber-300">{v.default_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setDiffEgg(null);
                  showToast('Egg успішно оновлено до найновішої версії!');
                }}
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400"
              >
                Застосувати оновлення шаблону
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
