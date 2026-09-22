import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Server,
  Activity,
  ShoppingBag,
  Layers,
  FileText,
  Shield,
  Plus,
  ArrowRight,
  Terminal,
  Sparkles,
  RefreshCw,
  Sliders,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    servers,
    nodes,
    eggs,
    setActiveTab,
    setSelectedServerId,
    setNewServerModalOpen,
    setOnboardingOpen,
    language,
    setLanguage,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Filter items based on query
  const lowerQuery = query.toLowerCase();

  const serverResults = servers
    .filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.game.toLowerCase().includes(lowerQuery) ||
        s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 4)
    .map((s) => ({
      id: `server_${s.id}`,
      type: 'server',
      title: s.name,
      subtitle: `${s.game} • Node: ${s.node_id} • Status: ${s.status}`,
      icon: Server,
      action: () => {
        setActiveTab('servers');
        setSelectedServerId(s.id);
        setCommandPaletteOpen(false);
      },
    }));

  const nodeResults = nodes
    .filter(
      (n) =>
        n.name.toLowerCase().includes(lowerQuery) ||
        n.fqdn.toLowerCase().includes(lowerQuery) ||
        n.region.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map((n) => ({
      id: `node_${n.id}`,
      type: 'node',
      title: n.name,
      subtitle: `${n.fqdn} • ${n.agent_version} • ${n.status}`,
      icon: Activity,
      action: () => {
        setActiveTab('nodes');
        setCommandPaletteOpen(false);
      },
    }));

  const eggResults = eggs
    .filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.game.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3)
    .map((e) => ({
      id: `egg_${e.id}`,
      type: 'egg',
      title: e.name,
      subtitle: `Шаблон Egg • ${e.game} • Рейтинг ${e.rating}`,
      icon: ShoppingBag,
      action: () => {
        setActiveTab('marketplace');
        setCommandPaletteOpen(false);
      },
    }));

  const systemActions = [
    {
      id: 'act_new_server',
      type: 'action',
      title: 'Створити новий ігровий сервер',
      subtitle: 'Відкрити вікно майстра розгортання контейнера',
      icon: Plus,
      action: () => {
        setNewServerModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_onboarding',
      type: 'action',
      title: 'Запустити Onboarding Wizard',
      subtitle: 'Покроковий помічник налаштування платформи',
      icon: Sparkles,
      action: () => {
        setOnboardingOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_scheduler',
      type: 'action',
      title: 'Відкрити D&D планувальник розміщення',
      subtitle: 'Візуальний розподіл серверів між нодами',
      icon: Sliders,
      action: () => {
        setActiveTab('scheduler');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_horizon',
      type: 'action',
      title: 'Монітор черг Horizon & Redis Streams',
      subtitle: 'Переглянути стан асинхронних фонових задач',
      icon: Layers,
      action: () => {
        setActiveTab('horizon');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_audit',
      type: 'action',
      title: 'Аудит-лог дій (Audit Trail with Diffs)',
      subtitle: 'Журнал змін кожного поля з деталями старе/нове',
      icon: FileText,
      action: () => {
        setActiveTab('audit');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_security',
      type: 'action',
      title: 'Безпека: Scoped API-токени & 2FA',
      subtitle: 'Управління двофакторною автентифікацією та токенами',
      icon: Shield,
      action: () => {
        setActiveTab('security');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act_lang',
      type: 'action',
      title: `Перемкнути мову інтерфейсу (${language === 'uk' ? 'English' : 'Українська'})`,
      subtitle: 'Змінити локалізацію панелі',
      icon: RefreshCw,
      action: () => {
        setLanguage(language === 'uk' ? 'en' : 'uk');
        setCommandPaletteOpen(false);
      },
    },
  ].filter(
    (a) =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.subtitle.toLowerCase().includes(lowerQuery)
  );

  const allItems = [...serverResults, ...nodeResults, ...eggResults, ...systemActions];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Введіть назву сервера, ноди, шаблон egg або дію..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Нічого не знайдено за запитом &ldquo;{query}&rdquo;
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'server'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.type === 'node'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : item.type === 'egg'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ навігація</span>
            <span>↵ вибрати</span>
            <span>esc закрити</span>
          </div>
          <span className="text-emerald-400 font-semibold">Meilisearch Fuzzy Filter</span>
        </div>
      </div>
    </div>
  );
};
