import React from 'react';
import {
  Server,
  Network,
  Activity,
  ShoppingBag,
  Layers,
  FileText,
  ShieldCheck,
  Users,
  CreditCard,
  Code2,
  Palette,
  Terminal,
  Cpu,
  Plus,
} from 'lucide-react';
import { useApp, ActiveTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    servers,
    nodes,
    queueJobs,
    currentUser,
    setNewServerModalOpen,
    setSelectedServerId,
    t,
  } = useApp();

  const activeJobsCount = queueJobs.filter((j) => j.status === 'processing').length;
  const runningServersCount = servers.filter((s) => s.status === 'running').length;

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    adminOnly?: boolean;
  }

  const clientNavItems: NavItem[] = [
    {
      id: 'servers',
      label: t.nav_servers,
      icon: Server,
      badge: `${runningServersCount}/${servers.length}`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'marketplace',
      label: t.nav_marketplace,
      icon: ShoppingBag,
      badge: 'Eggs',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'horizon',
      label: t.nav_horizon,
      icon: Layers,
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse',
    },
    {
      id: 'audit',
      label: t.nav_audit,
      icon: FileText,
    },
    {
      id: 'security',
      label: t.nav_security,
      icon: ShieldCheck,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      id: 'nodes',
      label: t.nav_nodes,
      icon: Activity,
      badge: `${nodes.length}`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
      adminOnly: true,
    },
    {
      id: 'scheduler',
      label: t.nav_scheduler,
      icon: Network,
      badge: 'D&D',
      badgeColor: 'bg-teal-500/10 text-teal-400 border border-teal-500/30',
      adminOnly: true,
    },
    {
      id: 'multitenant',
      label: t.nav_multitenant,
      icon: Users,
      adminOnly: true,
    },
    {
      id: 'billing',
      label: t.nav_billing,
      icon: CreditCard,
    },
    {
      id: 'api',
      label: t.nav_api,
      icon: Code2,
    },
    {
      id: 'whitelabel',
      label: t.nav_settings,
      icon: Palette,
      adminOnly: true,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== 'servers') {
      setSelectedServerId(null);
    }
  };

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden md:flex">
      {/* Upper Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Quick Action Button */}
        <button
          onClick={() => setNewServerModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.action_new_server}</span>
        </button>

        {/* Section: Operational */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Операційне управління
          </div>
          <nav className="space-y-1">
            {clientNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-medium ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Administration & Scalability */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
            <span>Адміністрація & Вузли</span>
            {currentUser.role !== 'superadmin' && currentUser.role !== 'admin' && (
              <span className="text-[9px] text-amber-500/80 font-normal lowercase">
                (обмежено)
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-medium ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: Node Agent Status & System Spec */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rootless Go Daemon</span>
          </span>
          <span className="text-emerald-400 font-semibold">v1.22</span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>Async Queue Worker</span>
          <span className="text-cyan-400">Horizon OK</span>
        </div>
      </div>
    </aside>
  );
};
