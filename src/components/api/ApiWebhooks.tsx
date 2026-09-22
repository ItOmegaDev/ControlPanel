import React, { useState } from 'react';
import {
  Code2,
  Key,
  Webhook,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiToken, WebhookEndpoint } from '../../types';

export const ApiWebhooks: React.FC = () => {
  const { apiTokens, webhooks, addApiToken, deleteApiToken, addWebhook, deleteWebhook, t } =
    useApp();
  const [activeTab, setActiveTab] = useState<'tokens' | 'webhooks'>('tokens');

  // Token creation state
  const [tokenName, setTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'servers:read',
    'servers:control',
  ]);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Webhook creation state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>([
    'server:status',
    'node:alert',
  ]);

  const availableScopes = [
    { id: 'servers:read', desc: 'Читання списку та стану серверів' },
    { id: 'servers:control', desc: 'Запуск, зупинка, перезапуск та команди' },
    { id: 'servers:write', desc: 'Зміна лімітів та файлів сервера' },
    { id: 'nodes:read', desc: 'Моніторинг завантаження нод' },
    { id: 'nodes:write', desc: 'Управління налаштуваннями нод' },
    { id: 'backups:manage', desc: 'Створення та відновлення бекапів' },
  ];

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;
    const rawToken = `cp_pat_${Math.random().toString(36).substring(2, 12)}_${Math.random().toString(36).substring(2, 12)}`;
    addApiToken({
      name: tokenName.trim(),
      token_prefix: rawToken.substring(0, 14) + '...',
      scopes: selectedScopes,
      allowed_ips: ['*'],
      expires_at: '2027-01-01',
    });
    setNewlyCreatedToken(rawToken);
    setTokenName('');
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    addWebhook(webhookUrl.trim(), webhookEvents);
    setWebhookUrl('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>{t.nav_api}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              OpenAPI 3.1
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            REST &amp; gRPC API з гранулярними токенами доступу (PAT) та Webhooks для Discord/CI/CD
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'tokens', label: 'Токени доступу (Personal Access Tokens)' },
          { id: 'webhooks', label: 'Webhooks сповіщення' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: TOKENS */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Create Token Box */}
          <form
            onSubmit={handleCreateToken}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Створити новий API токен
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Назва токена
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. WHMCS Billing, Terraform Provider, CI/CD"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1">
                  Гранулярні дозволи (Scopes)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {availableScopes.map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-center gap-2 text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope.id]);
                          } else {
                            setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                          }
                        }}
                        className="rounded accent-cyan-500"
                      />
                      <span>{scope.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              Згенерувати токен
            </button>

            {newlyCreatedToken && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between font-mono text-xs">
                <span className="text-emerald-300 truncate">
                  Новий токен: <strong>{newlyCreatedToken}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(newlyCreatedToken)}
                  className="text-emerald-400 hover:text-white px-2 py-1 rounded"
                >
                  {copied ? 'Скопійовано!' : 'Копіювати'}
                </button>
              </div>
            )}
          </form>

          {/* Tokens List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">Назва</th>
                  <th className="p-3.5">Токен</th>
                  <th className="p-3.5">Скоупи</th>
                  <th className="p-3.5">Створено</th>
                  <th className="p-3.5 text-right">Видалити</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {apiTokens.map((key: ApiToken) => (
                  <tr key={key.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold font-sans text-white">{key.name}</td>
                    <td className="p-3.5 text-cyan-300">{key.token_prefix}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.map((s: string) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{key.created_at.slice(0, 10)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteApiToken(key.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Відкликати токен"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: WEBHOOKS */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateWebhook}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-cyan-400" />
              Додати новий Webhook endpoint
            </h3>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Target URL (Discord Webhook, Slack, custom API)
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              Підключити Webhook
            </button>
          </form>

          {/* Webhooks list */}
          <div className="space-y-3">
            {webhooks.map((wh: WebhookEndpoint) => (
              <div
                key={wh.id}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <div className="text-white font-bold truncate max-w-lg">{wh.url}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Події: {wh.events.join(', ')} • Статус: {wh.last_delivery_status}
                  </div>
                </div>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
