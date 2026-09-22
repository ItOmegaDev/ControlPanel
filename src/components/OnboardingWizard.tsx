import React, { useState } from 'react';
import {
  Sparkles,
  Server,
  Activity,
  ShoppingBag,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Terminal,
  Cpu,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingWizard: React.FC = () => {
  const {
    onboardingOpen,
    setOnboardingOpen,
    eggs,
    nodes,
    createServer,
    toggle2FA,
    currentUser,
    setSelectedServerId,
    setActiveTab,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [selectedEggId, setSelectedEggId] = useState(eggs[0]?.id || 'egg_minecraft_paper');
  const [serverName, setServerName] = useState('My First Game Realm');
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0]?.id || 'node_fra_01');
  const [ramGb, setRamGb] = useState(8);
  const [cpuCores, setCpuCores] = useState(4);
  const [totpVerified, setTotpVerified] = useState(currentUser.two_factor_enabled);

  if (!onboardingOpen) return null;

  const agentInstallCommand = `curl -sSL https://get.controlpanel.io/agent/install.sh | sudo bash -s -- --token=cpa_setup_token_99182a --rootless`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(agentInstallCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleComplete = () => {
    const selectedEgg = eggs.find((e) => e.id === selectedEggId);
    const created = createServer({
      name: serverName,
      egg_id: selectedEggId,
      game: selectedEgg?.game || 'Minecraft: Java Edition',
      game_icon: selectedEgg?.icon || 'Pickaxe',
      node_id: selectedNodeId,
      limits: {
        cpu_percent: cpuCores * 100,
        ram_mb: ramGb * 1024,
        disk_mb: 30720,
        io_priority: 500,
        swap_mb: 1024,
      },
    });

    setOnboardingOpen(false);
    setActiveTab('servers');
    setSelectedServerId(created.id);
  };

  const steps = [
    { num: 1, label: 'Підключення ноди', icon: Activity },
    { num: 2, label: 'Вибір Egg', icon: ShoppingBag },
    { num: 3, label: 'Розгортання сервера', icon: Server },
    { num: 4, label: 'Безпека & 2FA', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Майстер початкового налаштування ControlPanel
              </h2>
              <p className="text-xs text-slate-400">
                Спадкоємець Pterodactyl: безпека за замовчуванням та нульове тертя
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnboardingOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline font-medium ${
                      isCurrent ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Connect Node */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Крок 1: Підключіть ваш перший Node Agent (Go 1.22+)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Node Agent працює у режимі rootless-контейнерів за замовчуванням, усуваючи
                  ризики ескалації привілеїв з ігрових серверів.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Команда встановлення на ноду (Ubuntu / Debian / RHEL)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 transition-colors"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3 h-3" />
                        Скопійовано!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Копіювати
                      </>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto text-emerald-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 selection:bg-emerald-500 selection:text-black">
                  {agentInstallCommand}
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-medium">
                    Виявлено 3 активних ноди в пулі (Frankfurt-01, Warsaw-02, Helsinki-01)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Daemon v1.22 Ready
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Select Egg */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Крок 2: Оберіть шаблон ігрового сервера з вбудованого Marketplace
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Шаблони Eggs містять перевірені Docker-образи та гнучкі схеми змінних у форматі
                  PostgreSQL JSONB.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eggs.map((egg) => {
                  const isSelected = egg.id === selectedEggId;
                  return (
                    <div
                      key={egg.id}
                      onClick={() => setSelectedEggId(egg.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{egg.name}</span>
                        {egg.official && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Офіційний
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {egg.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>v{egg.version}</span>
                        <span className="text-emerald-400 font-semibold">★ {egg.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Deploy Server */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Крок 3: Сконфігуруйте ліміти ресурсів контейнера
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Усі важкі операції розгортання виконуються асинхронно через Horizon без
                  блокування інтерфейсу.
                </p>
              </div>

              <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Назва сервера
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Оперативна пам&apos;ять (RAM)</span>
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
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Процесор (vCPU Cores)</span>
                      <span className="font-mono text-emerald-400 font-bold">{cpuCores} Cores</span>
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
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Цільова нода для розміщення
                  </label>
                  <select
                    value={selectedNodeId}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.region}) • Завантаження: {n.cpu_usage_percent}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Security & 2FA */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Крок 4: Принцип Secure by default (2FA & Rootless)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Згідно зі специфікацією ControlPanel, 2FA є обов&apos;язковою для адміністраторів, а
                  контейнери ізольовані у власних Docker-мережах.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Двофакторна автентифікація (TOTP)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Обов&apos;язково
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Підтримка Google Authenticator, 1Password, Bitwarden та WebAuthn/Passkeys.
                  </p>
                </div>
                <button
                  onClick={() => {
                    toggle2FA();
                    setTotpVerified(!totpVerified);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentUser.two_factor_enabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {currentUser.two_factor_enabled ? '✓ Активовано' : 'Увімкнути 2FA'}
                </button>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Перевірені конфігурації безпеки ядра:
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>User-namespace remapping (rootless) активовано для Node Agent</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Міжсерверний трафік у Docker-мережі за замовчуванням заблокований</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Повний аудит-лог (Audit Trail) фіксує всі зміни конфігурації</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium ${
              currentStep === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              <span>Далі</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Завершити налаштування & Розгорнути</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
