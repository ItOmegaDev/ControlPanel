import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Smartphone,
  Lock,
  FileCode,
  Globe,
  Check,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Trash2,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecuritySettings: React.FC = () => {
  const { t } = useApp();
  const [totpEnabled, setTotpEnabled] = useState(true);
  const [webAuthnEnabled, setWebAuthnEnabled] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess_1',
      device: 'Chrome 124 on macOS (Apple Silicon)',
      ip: '178.62.19.4',
      location: 'Kyiv, Ukraine',
      current: true,
      last_active: 'Зараз (Активна сесія)',
    },
    {
      id: 'sess_2',
      device: 'Firefox Developer Edition on Linux x86_64',
      ip: '194.44.112.5',
      location: 'Lviv, Ukraine',
      current: false,
      last_active: '2 години тому',
    },
    {
      id: 'sess_3',
      device: 'Mobile Safari on iPhone 15 Pro',
      ip: '91.214.85.12',
      location: 'Warsaw, Poland',
      current: false,
      last_active: 'Вчора о 21:40',
    },
  ]);

  const [ipAllowlist, setIpAllowlist] = useState<string[]>([
    '178.62.19.0/24',
    '194.44.112.0/24',
    '10.0.0.0/8 (Internal Overlay)',
  ]);
  const [newIp, setNewIp] = useState('');

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleRevokeSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Сесію успішно анульовано та токен відкликано');
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setIpAllowlist((prev) => [...prev, newIp.trim()]);
    setNewIp('');
    showToast('CIDR правило додано до списку дозволених адрес');
  };

  const handleRemoveIp = (index: number) => {
    setIpAllowlist((prev) => prev.filter((_, i) => i !== index));
    showToast('IP правило видалено');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Безпека та контроль доступу</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Zero-Trust
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Двоетапна автентифікація, WebAuthn апаратні ключі, Rootless ізоляція та аудит сесій
          </p>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Grid: 2FA + Hardware Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TOTP 2FA */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Двоетапна перевірка (TOTP 2FA)</h3>
                <p className="text-xs text-slate-400">Google Authenticator, Aegis, 1Password</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTotpEnabled(!totpEnabled);
                showToast(totpEnabled ? 'TOTP 2FA вимкнено' : 'TOTP 2FA успішно активовано');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                totpEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {totpEnabled ? 'Увімкнено' : 'Вимкнено'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Вимагає введення 6-значного одноразового коду безпеки під час кожного входу в панель керування.
          </p>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Секретний ключ підключення:</span>
            <code className="font-mono text-amber-300 font-bold tracking-wider">JBSW-Y3DP-EHPK-3PXP</code>
          </div>
        </div>

        {/* WebAuthn / FIDO2 */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Апаратні ключі безпеки (FIDO2)</h3>
                <p className="text-xs text-slate-400">YubiKey, Apple Touch ID, Windows Hello</p>
              </div>
            </div>
            <button
              onClick={() => {
                setWebAuthnEnabled(!webAuthnEnabled);
                showToast(webAuthnEnabled ? 'WebAuthn ключ вимкнено' : 'Апаратний ключ WebAuthn зареєстровано');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                webAuthnEnabled
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {webAuthnEnabled ? 'YubiKey 5C NFC' : 'Додати ключ'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Апаратний захист від фішингу на рівні браузера без передачі секретів через незахищені канали.
          </p>

          <div className="flex items-center gap-2 text-xs text-teal-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Сертифікат FIDO2 Level 2 підтверджено</span>
          </div>
        </div>
      </div>

      {/* Rootless Container Isolation Status */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Специфікація ізоляції: Rootless Daemon &amp; cgroups v2 (Section 4.1)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-medium">User Namespace</div>
            <div className="text-white font-mono font-bold">UID/GID Mapping: 100000:65536</div>
            <div className="text-[11px] text-emerald-400">root у контейнері = unprivileged у системі</div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-medium">cgroups v2 Hard Limits</div>
            <div className="text-white font-mono font-bold">memory.max, cpu.weight, io.max</div>
            <div className="text-[11px] text-emerald-400">Абсолютний захист від вичерпання ресурсів ноди</div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-medium">Seccomp &amp; AppArmor</div>
            <div className="text-white font-mono font-bold">controlpanel-default-v2.json</div>
            <div className="text-[11px] text-emerald-400">Блокування 44 небезпечних системних викликів</div>
          </div>
        </div>
      </div>

      {/* IP Allowlist / Geo-Firewall */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Дозволені IP-діапазони (CIDR IP Allowlist)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Вхід до панелі адміністратора дозволений лише із вказаних мереж
            </p>
          </div>
        </div>

        <form onSubmit={handleAddIp} className="flex gap-2">
          <input
            type="text"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="e.g. 195.140.220.0/24"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Додати CIDR
          </button>
        </form>

        <div className="space-y-2">
          {ipAllowlist.map((ip, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-emerald-300 font-semibold">{ip}</span>
              </div>
              <button
                onClick={() => handleRemoveIp(idx)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                title="Видалити"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-400" />
          Активні сесії входу
        </h3>

        <div className="divide-y divide-slate-800">
          {activeSessions.map((session) => (
            <div key={session.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{session.device}</span>
                  {session.current && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Цей пристрій
                    </span>
                  )}
                </div>
                <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                  IP: {session.ip} • {session.location} • {session.last_active}
                </div>
              </div>

              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                >
                  Завершити
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
