import React, { useState } from 'react';
import { Activity, X, Terminal, Copy, Check, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NewNodeModal: React.FC = () => {
  const { newNodeModalOpen, setNewNodeModalOpen, createNode } = useApp();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('Kyiv, Ukraine');
  const [countryCode, setCountryCode] = useState('UA');
  const [ip, setIp] = useState('185.193.17.42');
  const [fqdn, setFqdn] = useState('node-kiev-01.controlpanel.io');
  const [copied, setCopied] = useState(false);

  if (!newNodeModalOpen) return null;

  const installCommand = `curl -sSL https://get.controlpanel.io/agent/install.sh | sudo bash -s -- --token=cp_node_token_${Date.now().toString(36)} --rootless`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createNode({
      name: name.trim(),
      region,
      country_code: countryCode,
      ip,
      fqdn,
      cpu_cores: 16,
      ram_total_mb: 65536,
      disk_total_gb: 2048,
    });

    setNewNodeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Підключення нової ноди (Node Agent)</h2>
              <p className="text-[11px] text-slate-400">Go 1.22+ Daemon у режимі Rootless Podman/Docker</p>
            </div>
          </div>
          <button
            onClick={() => setNewNodeModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Node Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Назва ноди (e.g. Kyiv-01, Warsaw-03)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kyiv-DC-01 (AMD EPYC 7763)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Регіон / Локація</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Код країни (ISO 2-letter)</label>
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">IP-адреса хоста</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">FQDN доменне ім&apos;я</label>
              <input
                type="text"
                value={fqdn}
                onChange={(e) => setFqdn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Rootless curl command */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Команда встановлення на ноду:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Скопійовано' : 'Копіювати'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 rounded font-mono text-[11px] text-indigo-300 overflow-x-auto select-all">
              {installCommand}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setNewNodeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold"
            >
              Зареєструвати ноду в пулі
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
