import React, { useState } from 'react';
import {
  Layers,
  Users,
  Cpu,
  HardDrive,
  Globe,
  Plus,
  Check,
  Building,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TenantOrg {
  id: string;
  name: string;
  reseller_owner: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  servers_count: number;
  max_servers: number;
  allocated_ram_gb: number;
  max_ram_gb: number;
  allocated_cpu_cores: number;
  max_cpu_cores: number;
  created_at: string;
}

export const MultiTenantView: React.FC = () => {
  const { t } = useApp();
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [tenants, setTenants] = useState<TenantOrg[]>([
    {
      id: 'ten_kyiv_esports',
      name: 'Kyiv Esports League Arena',
      reseller_owner: 'reseller@kyiv-arena.ua',
      domain: 'panel.kyiv-arena.ua',
      status: 'active',
      servers_count: 14,
      max_servers: 30,
      allocated_ram_gb: 96,
      max_ram_gb: 128,
      allocated_cpu_cores: 48,
      max_cpu_cores: 64,
      created_at: '2026-01-15',
    },
    {
      id: 'ten_lviv_community',
      name: 'Lviv Craft Game Network',
      reseller_owner: 'hostmaster@lvivservers.com',
      domain: 'play.lvivservers.com',
      status: 'active',
      servers_count: 8,
      max_servers: 15,
      allocated_ram_gb: 48,
      max_ram_gb: 64,
      allocated_cpu_cores: 24,
      max_cpu_cores: 32,
      created_at: '2026-02-01',
    },
    {
      id: 'ten_poltava_dev',
      name: 'Dnipro Gaming Cluster',
      reseller_owner: 'admin@dnipro-host.net',
      domain: 'panel.dnipro-host.net',
      status: 'trial',
      servers_count: 3,
      max_servers: 10,
      allocated_ram_gb: 16,
      max_ram_gb: 32,
      allocated_cpu_cores: 8,
      max_cpu_cores: 16,
      created_at: '2026-03-10',
    },
  ]);

  const [newOrgName, setNewOrgName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    const newTenant: TenantOrg = {
      id: `ten_${Date.now().toString(36)}`,
      name: newOrgName.trim(),
      reseller_owner: 'reseller@controlpanel.gg',
      domain: newDomain.trim() || `${newOrgName.toLowerCase().replace(/\s+/g, '-')}.controlpanel.gg`,
      status: 'active',
      servers_count: 0,
      max_servers: 10,
      allocated_ram_gb: 0,
      max_ram_gb: 32,
      allocated_cpu_cores: 0,
      max_cpu_cores: 16,
      created_at: new Date().toISOString().split('T')[0],
    };

    setTenants([newTenant, ...tenants]);
    setNewOrgName('');
    setNewDomain('');
    setShowAddModal(false);
    showToast(`Організацію "${newTenant.name}" успішно створено з пулом квот`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Multi-tenancy &amp; Реселерські організації</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Section 3.6
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ізольовані суборганізації, розподіл квот пам'яті, процесорів та незалежні домени брендів
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Нова організація (Tenant)</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Активні організації</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{tenants.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">100% працездатні</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Всього серверів під орендою</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {tenants.reduce((acc, cur) => acc + cur.servers_count, 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">З ліміту 55 серверів</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Виділено RAM (GB)</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {tenants.reduce((acc, cur) => acc + cur.allocated_ram_gb, 0)} GB
          </div>
          <div className="text-[11px] text-amber-400 mt-1">З пулу 224 GB</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Виділено vCPU Cores</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {tenants.reduce((acc, cur) => acc + cur.allocated_cpu_cores, 0)} vCPU
          </div>
          <div className="text-[11px] text-purple-400 mt-1">З пулу 112 vCPU</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            Список клієнтських тенантів
          </h2>
        </div>

        <div className="divide-y divide-slate-800">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-white text-sm">{tenant.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      tenant.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                  <span>Домен: {tenant.domain}</span>
                  <span>•</span>
                  <span>Власник: {tenant.reseller_owner}</span>
                </div>
              </div>

              {/* Resource Quotas */}
              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[10px]">СЕРВЕРИ</div>
                  <div className="text-white font-bold">
                    {tenant.servers_count} / {tenant.max_servers}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px]">RAM КВОТА</div>
                  <div className="text-emerald-400 font-bold">
                    {tenant.allocated_ram_gb} / {tenant.max_ram_gb} GB
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px]">vCPU КВОТА</div>
                  <div className="text-teal-400 font-bold">
                    {tenant.allocated_cpu_cores} / {tenant.max_cpu_cores} Cores
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Квоти для ${tenant.name} збережено`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Керувати квотами
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              Створити нову реселерську організацію
            </h3>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Назва компанії / Тенанта</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Odesa Gaming Servers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Кастомний домен (FQDN)</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="panel.odesagaming.ua"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Створити Тенант
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
