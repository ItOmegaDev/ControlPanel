import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Node,
  Server,
  Egg,
  QueueJob,
  AuditLogEntry,
  ApiToken,
  ActiveSession,
  BillingPlan,
  WebhookEndpoint,
  WhiteLabelConfig,
  UserRole,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_NODES,
  INITIAL_SERVERS,
  INITIAL_EGGS,
  INITIAL_QUEUE_JOBS,
  INITIAL_AUDIT_LOGS,
  INITIAL_API_TOKENS,
  INITIAL_SESSIONS,
  INITIAL_BILLING_PLANS,
  INITIAL_WEBHOOKS,
  INITIAL_WHITE_LABEL,
} from '../mockData';
import { Language, TRANSLATIONS } from '../locales';

export type ActiveTab =
  | 'servers'
  | 'scheduler'
  | 'nodes'
  | 'marketplace'
  | 'horizon'
  | 'audit'
  | 'security'
  | 'multitenant'
  | 'billing'
  | 'api'
  | 'whitelabel';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedServerId: string | null;
  setSelectedServerId: (id: string | null) => void;
  
  // Data collections
  nodes: Node[];
  servers: Server[];
  eggs: Egg[];
  queueJobs: QueueJob[];
  auditLogs: AuditLogEntry[];
  apiTokens: ApiToken[];
  sessions: ActiveSession[];
  billingPlans: BillingPlan[];
  webhooks: WebhookEndpoint[];
  whiteLabel: WhiteLabelConfig;
  setWhiteLabel: React.Dispatch<React.SetStateAction<WhiteLabelConfig>>;
  
  // Actions
  updateServerStatus: (serverId: string, status: Server['status']) => void;
  updateServerLimits: (serverId: string, limits: Server['limits']) => void;
  createServer: (newServer: Partial<Server>) => Server;
  deleteServer: (serverId: string) => void;
  toggleNodeMaintenance: (nodeId: string) => void;
  migrateServerAsync: (serverId: string, targetNodeId: string) => void;
  bulkMigrateServers: (serverIds: string[], targetNodeId: string) => void;
  bulkChangeStatus: (serverIds: string[], status: Server['status']) => void;
  bulkAssignTag: (serverIds: string[], tag: string) => void;
  createAuditEntry: (action: string, entityType: AuditLogEntry['entity_type'], entityName: string, entityId: string, diff: AuditLogEntry['diff']) => void;
  installEggFromMarketplace: (eggId: string) => void;
  createNode: (newNode: Partial<Node>) => Node;
  retryJob: (jobId: string) => void;
  addApiToken: (token: Omit<ApiToken, 'id' | 'created_at' | 'last_used_at'>) => void;
  deleteApiToken: (id: string) => void;
  addWebhook: (url: string, events: string[]) => void;
  deleteWebhook: (id: string) => void;
  revokeSession: (sessionId: string) => void;
  toggle2FA: () => void;
  
  // UI & Dialogs
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  newServerModalOpen: boolean;
  setNewServerModalOpen: (open: boolean) => void;
  newNodeModalOpen: boolean;
  setNewNodeModalOpen: (open: boolean) => void;
  
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['uk'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState<ActiveTab>('servers');
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [servers, setServers] = useState<Server[]>(INITIAL_SERVERS);
  const [eggs, setEggs] = useState<Egg[]>(INITIAL_EGGS);
  const [queueJobs, setQueueJobs] = useState<QueueJob[]>(INITIAL_QUEUE_JOBS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [apiTokens, setApiTokens] = useState<ApiToken[]>(INITIAL_API_TOKENS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [billingPlans] = useState<BillingPlan[]>(INITIAL_BILLING_PLANS);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelConfig>(INITIAL_WHITE_LABEL);
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [newServerModalOpen, setNewServerModalOpen] = useState(false);
  const [newNodeModalOpen, setNewNodeModalOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('uk');

  const t = TRANSLATIONS[language];

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createAuditEntry = (
    action: string,
    entityType: AuditLogEntry['entity_type'],
    entityName: string,
    entityId: string,
    diff: AuditLogEntry['diff']
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      actor_name: currentUser.name,
      actor_email: currentUser.email,
      actor_role: currentUser.role,
      action,
      entity_type: entityType,
      entity_name: entityName,
      entity_id: entityId,
      diff,
      ip: '193.106.31.2',
      via: 'UI',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'superadmin'
          ? 'Maksym Bondar (Superadmin)'
          : role === 'reseller'
          ? 'Oleh Reseller (EU Games Cloud)'
          : role === 'user'
          ? 'Danilo Client (Server Owner)'
          : 'Anna TeamMember (Moderator)',
    }));
  };

  const updateServerStatus = (serverId: string, status: Server['status']) => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id === serverId) {
          createAuditEntry('server:power:signal', 'server', s.name, s.id, [
            { field: 'status', old_value: s.status, new_value: status },
          ]);
          return {
            ...s,
            status,
            current_stats:
              status === 'offline' || status === 'stopping'
                ? { ...s.current_stats, cpu_percent: 0, ram_mb: 0, players_online: 0 }
                : s.current_stats,
          };
        }
        return s;
      })
    );
  };

  const updateServerLimits = (serverId: string, limits: Server['limits']) => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id === serverId) {
          createAuditEntry('server:limits:update', 'server', s.name, s.id, [
            { field: 'limits.cpu_percent', old_value: s.limits.cpu_percent, new_value: limits.cpu_percent },
            { field: 'limits.ram_mb', old_value: s.limits.ram_mb, new_value: limits.ram_mb },
            { field: 'limits.disk_mb', old_value: s.limits.disk_mb, new_value: limits.disk_mb },
          ]);
          return { ...s, limits, updated_at: new Date().toISOString() };
        }
        return s;
      })
    );
  };

  const createServer = (newServerData: Partial<Server>): Server => {
    const generatedId = `srv_${Date.now()}`;
    const fullServer: Server = {
      id: generatedId,
      uuid: crypto.randomUUID ? crypto.randomUUID() : `uuid-${Date.now()}`,
      name: newServerData.name || 'Game Server',
      description: newServerData.description || 'Dedicated game instance',
      game: newServerData.game || 'Minecraft: Java Edition',
      game_icon: newServerData.game_icon || 'Gamepad2',
      egg_id: newServerData.egg_id || 'egg_minecraft_paper',
      node_id: newServerData.node_id || 'node_fra_01',
      owner_id: currentUser.id,
      owner_email: currentUser.email,
      status: 'starting',
      limits: newServerData.limits || {
        cpu_percent: 200,
        ram_mb: 8192,
        disk_mb: 20480,
        io_priority: 500,
        swap_mb: 1024,
      },
      current_stats: {
        cpu_percent: 12,
        ram_mb: 2048,
        disk_mb: 3200,
        net_rx_kb: 450,
        net_tx_kb: 600,
        uptime_seconds: 10,
        players_online: 0,
        players_max: 32,
      },
      tags: newServerData.tags || ['custom'],
      docker_image: newServerData.docker_image || 'ghcr.io/pterodactyl/yolks:java_21',
      startup_command: newServerData.startup_command || 'java -jar server.jar',
      environment_variables: newServerData.environment_variables || {},
      ports: newServerData.ports || [
        { port: 25565 + Math.floor(Math.random() * 2000), protocol: 'tcp', primary: true, notes: 'Game Port' },
      ],
      network_isolated: true,
      auto_restart_on_crash: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setServers((prev) => [fullServer, ...prev]);

    // Dispatch async background provisioning task
    const job: QueueJob = {
      id: `job_prov_${Date.now()}`,
      title: `Container Provisioning: ${fullServer.name}`,
      type: 'container_pull',
      status: 'processing',
      progress: 15,
      current_step: `Pulling ${fullServer.docker_image} (Rootless Docker agent)`,
      started_at: new Date().toISOString(),
      server_id: fullServer.id,
      node_id: fullServer.node_id,
    };
    setQueueJobs((prev) => [job, ...prev]);

    createAuditEntry('server:create', 'server', fullServer.name, fullServer.id, [
      { field: 'node_id', old_value: null, new_value: fullServer.node_id },
      { field: 'egg_id', old_value: null, new_value: fullServer.egg_id },
    ]);

    return fullServer;
  };

  const deleteServer = (serverId: string) => {
    const srv = servers.find((s) => s.id === serverId);
    if (srv) {
      createAuditEntry('server:delete', 'server', srv.name, srv.id, [
        { field: 'deleted', old_value: false, new_value: true },
      ]);
      setServers((prev) => prev.filter((s) => s.id !== serverId));
      if (selectedServerId === serverId) {
        setSelectedServerId(null);
      }
    }
  };

  const toggleNodeMaintenance = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const nextState = !n.maintenance_mode;
          createAuditEntry('node:maintenance:toggle', 'node', n.name, n.id, [
            { field: 'maintenance_mode', old_value: n.maintenance_mode, new_value: nextState },
          ]);
          return {
            ...n,
            maintenance_mode: nextState,
            status: nextState ? 'maintenance' : 'online',
          };
        }
        return n;
      })
    );
  };

  const migrateServerAsync = (serverId: string, targetNodeId: string) => {
    const srv = servers.find((s) => s.id === serverId);
    const targetNode = nodes.find((n) => n.id === targetNodeId);
    if (!srv || !targetNode) return;

    // Create Horizon async job
    const newJob: QueueJob = {
      id: `job_mig_${Date.now()}`,
      title: `Live Migration: ${srv.name} ➔ ${targetNode.name}`,
      type: 'migration',
      status: 'processing',
      progress: 5,
      current_step: 'Initial storage sync & container freeze via Node Agent',
      started_at: new Date().toISOString(),
      server_id: srv.id,
      node_id: targetNode.id,
    };
    setQueueJobs((prev) => [newJob, ...prev]);

    // Update server node
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, node_id: targetNodeId, status: 'starting' } : s))
    );

    createAuditEntry('server:migrate', 'server', srv.name, srv.id, [
      { field: 'node_id', old_value: srv.node_id, new_value: targetNodeId },
    ]);
  };

  const bulkMigrateServers = (serverIds: string[], targetNodeId: string) => {
    const targetNode = nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return;

    serverIds.forEach((id) => {
      migrateServerAsync(id, targetNodeId);
    });
  };

  const bulkChangeStatus = (serverIds: string[], status: Server['status']) => {
    serverIds.forEach((id) => {
      updateServerStatus(id, status);
    });
  };

  const bulkAssignTag = (serverIds: string[], tag: string) => {
    setServers((prev) =>
      prev.map((s) => {
        if (serverIds.includes(s.id) && !s.tags.includes(tag)) {
          return { ...s, tags: [...s.tags, tag] };
        }
        return s;
      })
    );
    createAuditEntry('server:tags:bulk', 'server', `${serverIds.length} servers`, 'bulk', [
      { field: 'tag_added', old_value: null, new_value: tag },
    ]);
  };

  const installEggFromMarketplace = (eggId: string) => {
    const targetEgg = eggs.find((e) => e.id === eggId);
    if (targetEgg) {
      const job: QueueJob = {
        id: `job_egg_${Date.now()}`,
        title: `Egg Install: ${targetEgg.name}`,
        type: 'egg_install',
        status: 'processing',
        progress: 25,
        current_step: 'Validating JSONB variables schema & testing Docker base image',
        started_at: new Date().toISOString(),
      };
      setQueueJobs((prev) => [job, ...prev]);
    }
  };

  const createNode = (newNode: Partial<Node>): Node => {
    const node: Node = {
      id: `node_${Date.now()}`,
      name: newNode.name || 'New Node',
      fqdn: newNode.fqdn || 'node.controlpanel.io',
      ip: newNode.ip || '127.0.0.1',
      region: newNode.region || 'Europe, Central',
      country_code: newNode.country_code || 'UA',
      agent_version: 'v1.22.4-go',
      status: 'online',
      maintenance_mode: false,
      is_rootless: true,
      daemon_type: 'docker',
      latency_ms: 18,
      uptime_days: 0,
      cpu_cores: newNode.cpu_cores || 16,
      cpu_usage_percent: 12,
      ram_total_mb: newNode.ram_total_mb || 65536,
      ram_used_mb: 4096,
      disk_total_gb: newNode.disk_total_gb || 2048,
      disk_used_gb: 120,
      servers_count: 0,
      agent_token: `cpa_tok_${Math.random().toString(36).substring(2, 15)}`,
      alert_thresholds: {
        disk_warn_percent: 90,
        cpu_warn_percent: 85,
        notify_discord: true,
        notify_email: true,
      },
      ...newNode,
    };
    setNodes((prev) => [...prev, node]);
    createAuditEntry('node:create', 'node', node.name, node.id, [
      { field: 'ip', old_value: null, new_value: node.ip },
    ]);
    return node;
  };

  const retryJob = (jobId: string) => {
    setQueueJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'processing',
              progress: 10,
              current_step: 'Retrying job via Horizon worker...',
            }
          : j
      )
    );
  };

  const deleteApiToken = (id: string) => {
    setApiTokens((prev) => prev.filter((t) => t.id !== id));
  };

  const addWebhook = (url: string, events: string[]) => {
    const newWh: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      name: 'Custom Webhook',
      url,
      events,
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      active: true,
      last_delivery_status: '200 OK',
      last_delivery_time: new Date().toLocaleTimeString(),
    };
    setWebhooks((prev) => [newWh, ...prev]);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const addApiToken = (tokenData: Omit<ApiToken, 'id' | 'created_at' | 'last_used_at'>) => {
    const newToken: ApiToken = {
      ...tokenData,
      id: `tok_${Date.now()}`,
      created_at: new Date().toISOString(),
      last_used_at: 'Ще не використовувався',
    };
    setApiTokens((prev) => [newToken, ...prev]);
    createAuditEntry('security:token:create', 'token', newToken.name, newToken.id, [
      { field: 'scopes', old_value: [], new_value: newToken.scopes },
    ]);
  };

  const revokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const toggle2FA = () => {
    setCurrentUser((prev) => {
      const nextVal = !prev.two_factor_enabled;
      createAuditEntry('security:2fa:toggle', 'security', prev.name, prev.id, [
        { field: 'two_factor_enabled', old_value: prev.two_factor_enabled, new_value: nextVal },
      ]);
      return { ...prev, two_factor_enabled: nextVal };
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        activeTab,
        setActiveTab,
        selectedServerId,
        setSelectedServerId,
        nodes,
        servers,
        eggs,
        queueJobs,
        auditLogs,
        apiTokens,
        sessions,
        billingPlans,
        webhooks,
        whiteLabel,
        setWhiteLabel,
        updateServerStatus,
        updateServerLimits,
        createServer,
        deleteServer,
        toggleNodeMaintenance,
        migrateServerAsync,
        bulkMigrateServers,
        bulkChangeStatus,
        bulkAssignTag,
        createAuditEntry,
        installEggFromMarketplace,
        createNode,
        retryJob,
        addApiToken,
        deleteApiToken,
        addWebhook,
        deleteWebhook,
        revokeSession,
        toggle2FA,
        commandPaletteOpen,
        setCommandPaletteOpen,
        onboardingOpen,
        setOnboardingOpen,
        newServerModalOpen,
        setNewServerModalOpen,
        newNodeModalOpen,
        setNewNodeModalOpen,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
