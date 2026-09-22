import React from 'react';
import {
  Search,
  Server,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Globe,
  UserCheck,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    setCommandPaletteOpen,
    setOnboardingOpen,
    queueJobs,
    setActiveTab,
    language,
    setLanguage,
    whiteLabel,
    nodes,
    t,
  } = useApp();

  const activeJobsCount = queueJobs.filter((j) => j.status === 'processing').length;
  const onlineNodesCount = nodes.filter((n) => n.status === 'online').length;

  const roleLabels: Record<UserRole, string> = {
    superadmin: t.role_superadmin,
    admin: t.role_admin,
    reseller: t.role_reseller,
    user: t.role_user,
    team_member: t.role_team_member,
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Brand & Search */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl">
        <button
          onClick={() => {
            setActiveTab('servers');
          }}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Server className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              {whiteLabel.panel_name}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v1.0
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5 font-mono">
              Next-Gen Game Infrastructure
            </span>
          </div>
        </button>

        {/* Global Search Bar (Cmd+K) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 bg-slate-950/80 hover:bg-slate-950 text-slate-400 hover:text-slate-200 px-3.5 py-2 rounded-lg border border-slate-800/80 hover:border-slate-700 text-xs w-full max-w-md transition-all shadow-inner group"
        >
          <Search className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          <span className="flex-1 text-left truncate font-normal">
            {t.search_placeholder}
          </span>
          <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 rounded border border-slate-700">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Status Indicators, Role Switcher, Language, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Horizon Queue Indicator */}
        <button
          onClick={() => setActiveTab('horizon')}
          title="Active Horizon queue workers"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            {activeJobsCount > 0 ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
            )}
          </span>
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-xs hidden lg:inline">
            Horizon: <span className="text-cyan-400 font-semibold">{activeJobsCount}</span>
          </span>
        </button>

        {/* Nodes Health Indicator */}
        <button
          onClick={() => setActiveTab('nodes')}
          title="Node Agent Health Status"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-xs">
            {onlineNodesCount}/{nodes.length} Nodes
          </span>
        </button>

        {/* Onboarding Wizard Trigger */}
        <button
          onClick={() => setOnboardingOpen(true)}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Онбординг</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center border border-slate-800 rounded-lg p-0.5 bg-slate-950/80">
          <button
            onClick={() => setLanguage('uk')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              language === 'uk'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            UA
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-[11px] font-semibold rounded ${
              language === 'en'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Role Switcher (Multi-tenant RBAC permissions) */}
        <div className="relative group">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer transition-colors">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium max-w-[100px] truncate">
              {roleLabels[currentUser.role]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
            <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
              Ролі доступу (Multi-tenant RBAC)
            </div>
            {(['superadmin', 'admin', 'reseller', 'user', 'team_member'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  currentUser.role === r
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{roleLabels[r]}</span>
                {currentUser.role === r && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2FA Badge & Avatar */}
        <button
          onClick={() => setActiveTab('security')}
          className="flex items-center gap-2 pl-1 group focus:outline-none"
          title="Налаштування профілю та 2FA"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-slate-800 group-hover:ring-emerald-500 object-cover transition-all"
            />
            {currentUser.two_factor_enabled ? (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-black"
                title="2FA Захищено (TOTP)"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </span>
            ) : (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white"
                title="2FA не налаштовано"
              >
                <ShieldAlert className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
