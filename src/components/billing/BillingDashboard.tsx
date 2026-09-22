import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Check,
  AlertCircle,
  Download,
  Settings,
  Shield,
  Palette,
  Clock,
  Coins,
  Globe,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BillingPlan } from '../../types';

interface BillingDashboardProps {
  initialTab?: 'plans' | 'gateways' | 'invoices' | 'whitelabel';
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ initialTab = 'plans' }) => {
  const { billingPlans, t } = useApp();
  const [activeTab, setActiveTab] = useState<'plans' | 'gateways' | 'invoices' | 'whitelabel'>(initialTab);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // White-label settings state
  const [brandName, setBrandName] = useState('KyivHost Cloud');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [customDomain, setCustomDomain] = useState('panel.kyivhost.ua');

  // Invoices mock
  const [invoices] = useState([
    { id: 'INV-2026-084', date: '2026-03-01', amount: '€49.00', status: 'paid', method: 'Mono Checkout', plan: 'Enterprise Dedicated' },
    { id: 'INV-2026-041', date: '2026-02-01', amount: '€49.00', status: 'paid', method: 'LiqPay', plan: 'Enterprise Dedicated' },
    { id: 'INV-2026-009', date: '2026-01-01', amount: '€49.00', status: 'paid', method: 'Stripe', plan: 'Enterprise Dedicated' },
  ]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>{t.nav_billing} &amp; White-label</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Multi-Gateway
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Управління тарифними планами, платіжними шлюзами (Stripe, Mono, LiqPay, BTCPay) та брендингом
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'plans', label: 'Тарифні плани (Plans)' },
          { id: 'gateways', label: 'Платіжні шлюзи (Payment Gateways)' },
          { id: 'invoices', label: 'Рахунки & Інвойси' },
          { id: 'whitelabel', label: 'White-label брендинг' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TAB: PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {billingPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 shadow-xl space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      ${plan.price_usd}/міс
                    </span>
                  </div>

                  <div className="space-y-2 mt-4 text-xs font-mono text-slate-300">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Пам&apos;ять (RAM):</span>
                      <span className="font-bold text-white">{plan.memory_gb} GB</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Процесор (CPU):</span>
                      <span className="font-bold text-white">{plan.cpu_cores} vCPU ({plan.cpu_cores * 100}%)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">NVMe Диск:</span>
                      <span className="font-bold text-white">{plan.disk_gb} GB</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Бази даних (MySQL):</span>
                      <span className="font-bold text-white">{plan.databases_allowed} шт</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Резервні копії (Backups):</span>
                      <span className="font-bold text-white">{plan.backups_allowed} слотів</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors">
                    Редагувати ліміти тарифу
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grace Period policy banner - Section 3.6 */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white">
                  Політика пільгового періоду несплати (Grace Period Policy):
                </span>
                <p className="text-slate-400 mt-0.5">
                  Сервер призупиняється (Suspend) через 3 дні після закінчення підписки. Повне видалення
                  контейнера — через 14 днів.
                </p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs whitespace-nowrap">
              Налаштувати терміни
            </button>
          </div>
        </div>
      )}

      {/* TAB: GATEWAYS */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Mono Checkout (Monobank)', status: 'Активно', desc: 'Еквайринг через Monobank Open API для України та ЄС', active: true },
            { name: 'LiqPay (ПриватБанк)', status: 'Активно', desc: 'Миттєві виплати та Apple Pay / Google Pay', active: true },
            { name: 'Stripe Billing & Elements', status: 'Активно', desc: 'Міжнародні кредитні картки, SEPA Direct Debit', active: true },
            { name: 'BTCPay Server (Crypto)', status: 'Готово до підключення', desc: 'Self-hosted оплата Bitcoin, Lightning Network та USDT', active: false },
          ].map((gw) => (
            <div
              key={gw.name}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{gw.name}</span>
                  {gw.active && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{gw.desc}</p>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                Налаштувати
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Номер</th>
                <th className="p-3.5">Дата</th>
                <th className="p-3.5">Тарифний план</th>
                <th className="p-3.5">Шлюз</th>
                <th className="p-3.5">Сума</th>
                <th className="p-3.5">Статус</th>
                <th className="p-3.5 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">{inv.id}</td>
                  <td className="p-3.5 text-slate-400">{inv.date}</td>
                  <td className="p-3.5 font-sans text-slate-200">{inv.plan}</td>
                  <td className="p-3.5 text-slate-400">{inv.method}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{inv.amount}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Сплачено
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => showToast(`Завантаження квитанції ${inv.id}.pdf`)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: WHITE-LABEL BRANDING */}
      {activeTab === 'whitelabel' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              White-label брендування для хостинг-провайдерів (Section 3.6)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Повна кастомізація логотипу, домену, фавікона та кольорових токенів без згадок про ControlPanel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Назва вашого хостингу (Brand Name)
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Кастомний піддомен для клієнтів (FQDN)
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Акцентний колір теми (Hex color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast('White-label налаштування бренду збережено!')}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              Зберегти налаштування White-label
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
