export type UserRole = 'superadmin' | 'admin' | 'reseller' | 'user' | 'team_member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  two_factor_enabled: boolean;
  two_factor_type?: 'totp' | 'webauthn';
  reseller_scope_id?: string;
  reseller_company_name?: string;
  created_at: string;
}

export interface Node {
  id: string;
  name: string;
  fqdn: string;
  ip: string;
  region: string;
  country_code: string;
  agent_version: string;
  status: 'online' | 'offline' | 'maintenance';
  maintenance_mode: boolean;
  is_rootless: boolean;
  daemon_type: 'docker' | 'podman';
  latency_ms: number;
  uptime_days: number;
  cpu_cores: number;
  cpu_usage_percent: number;
  ram_total_mb: number;
  ram_used_mb: number;
  disk_total_gb: number;
  disk_used_gb: number;
  servers_count: number;
  agent_token: string;
  alert_thresholds: {
    disk_warn_percent: number;
    cpu_warn_percent: number;
    notify_discord: boolean;
    notify_email: boolean;
  };
}

export interface ServerPort {
  port: number;
  protocol: 'tcp' | 'udp' | 'both';
  primary: boolean;
  notes?: string;
}

export interface ServerLimits {
  cpu_percent: number; // e.g. 200 = 2 cores
  ram_mb: number;
  disk_mb: number;
  io_priority: number; // 100-1000
  swap_mb: number;
}

export interface ServerLiveStats {
  cpu_percent: number;
  ram_mb: number;
  disk_mb: number;
  net_rx_kb: number;
  net_tx_kb: number;
  uptime_seconds: number;
  players_online: number;
  players_max: number;
}

export type ServerStatus = 'running' | 'starting' | 'stopping' | 'offline' | 'suspended';

export interface Server {
  id: string;
  uuid: string;
  name: string;
  description: string;
  game: string;
  game_icon: string;
  egg_id: string;
  node_id: string;
  owner_id: string;
  owner_email: string;
  team_id?: string;
  status: ServerStatus;
  limits: ServerLimits;
  current_stats: ServerLiveStats;
  tags: string[];
  docker_image: string;
  startup_command: string;
  environment_variables: Record<string, string>;
  ports: ServerPort[];
  network_isolated: boolean;
  auto_restart_on_crash: boolean;
  created_at: string;
  updated_at: string;
}

export interface EggVariable {
  key: string;
  name: string;
  description: string;
  default_value: string;
  user_viewable: boolean;
  user_editable: boolean;
  rules: string;
}

export interface Egg {
  id: string;
  name: string;
  game: string;
  category: 'games' | 'voice' | 'databases';
  icon: string;
  docker_image: string;
  startup_command: string;
  config_schema: Record<string, any>;
  variables: EggVariable[];
  version: string;
  author: string;
  rating: number;
  downloads: number;
  official: boolean;
  description: string;
  readme: string;
}

export interface QueueJob {
  id: string;
  title: string;
  type: 'migration' | 'backup' | 'egg_install' | 'bulk_action' | 'sync' | 'container_pull';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  current_step: string;
  started_at: string;
  duration_seconds?: number;
  server_id?: string;
  node_id?: string;
}

export interface AuditDiff {
  field: string;
  old_value: any;
  new_value: any;
}

export interface AuditLogEntry {
  id: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  action: string;
  entity_type: 'server' | 'node' | 'user' | 'egg' | 'token' | 'billing' | 'security';
  entity_name: string;
  entity_id: string;
  diff: AuditDiff[];
  ip: string;
  via: 'UI' | 'API' | 'CLI';
  created_at: string;
}

export interface ApiToken {
  id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  allowed_ips: string[];
  expires_at: string;
  last_used_at: string;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  last_active: string;
}

export interface ServerBackup {
  id: string;
  server_id: string;
  name: string;
  size_mb: number;
  storage_driver: 'local' | 's3_minio' | 'backblaze';
  checksum_sha256: string;
  status: 'completed' | 'generating' | 'restoring';
  created_at: string;
}

export interface ServerSnapshot {
  id: string;
  server_id: string;
  name: string;
  limits: ServerLimits;
  startup_command: string;
  created_at: string;
}

export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  modified_at: string;
  permissions: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  badge?: string;
  price_usd: number;
  memory_gb: number;
  cpu_cores: number;
  disk_gb: number;
  backups_allowed: number;
  databases_allowed: number;
  popular?: boolean;
  description: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  last_delivery_status: '200 OK' | '500 Error' | 'pending';
  last_delivery_time: string;
}

export interface WhiteLabelConfig {
  panel_name: string;
  company_name: string;
  logo_text: string;
  accent_color: 'emerald' | 'cyan' | 'indigo' | 'violet' | 'amber';
  support_url: string;
  custom_footer: string;
}
