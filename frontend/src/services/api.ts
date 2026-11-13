import {
  ChatResponse,
  DashboardStats,
  SimulationScenario,
  SimulationResult,
  PolicyRule,
  ThreatItem,
  AuditLogItem,
  BenchmarkMetrics,
  ToolExecutionTrace
} from '../types';

const API_BASE = '/api';

export const api = {
  // Agent
  async chatWithAgent(payload: {
    message: string;
    session_id?: string;
    user_id?: string;
    user_role?: string;
    protected_mode?: boolean;
    confirmation_token?: string;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Failed to communicate with agent');
    }
    return res.json();
  },

  async getAgentState(): Promise<any> {
    const res = await fetch(`${API_BASE}/agent/state`);
    return res.json();
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
    return res.json();
  },

  // Simulation
  async getScenarios(): Promise<SimulationScenario[]> {
    const res = await fetch(`${API_BASE}/simulation/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  },

  async runSimulation(scenario_id: string, protected_mode: boolean): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id, protected_mode })
    });
    if (!res.ok) throw new Error('Simulation execution failed');
    return res.json();
  },

  async runAllSimulations(protected_mode: boolean): Promise<SimulationResult[]> {
    const res = await fetch(`${API_BASE}/simulation/run-all?protected_mode=${protected_mode}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Batch simulation execution failed');
    return res.json();
  },

  async getSimulationHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/simulation/history`);
    return res.json();
  },

  // Gateway
  async inspectGateway(): Promise<any> {
    const res = await fetch(`${API_BASE}/gateway/inspect`);
    return res.json();
  },

  async testDirectTool(payload: {
    tool_name: string;
    arguments: Record<string, any>;
    user_id?: string;
    user_role?: string;
    protected_mode?: boolean;
    confirmation_token?: string;
  }): Promise<ToolExecutionTrace> {
    const res = await fetch(`${API_BASE}/gateway/test-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw err;
    }
    return res.json();
  },

  // Policies
  async getPolicies(): Promise<PolicyRule[]> {
    const res = await fetch(`${API_BASE}/policies`);
    return res.json();
  },

  async updatePolicy(id: number, update: Partial<PolicyRule>): Promise<PolicyRule> {
    const res = await fetch(`${API_BASE}/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update policy');
    return res.json();
  },

  async resetPolicies(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/policies/reset`, { method: 'POST' });
    return res.json();
  },

  // Threats
  async getThreats(filters?: { severity?: string; category?: string; search?: string }): Promise<ThreatItem[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE}/threats?${params.toString()}`);
    return res.json();
  },

  async getThreatAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/threats/analytics`);
    return res.json();
  },

  // Audit
  async getAuditLogs(filters?: { decision?: string; search?: string }): Promise<AuditLogItem[]> {
    const params = new URLSearchParams();
    if (filters?.decision) params.append('decision', filters.decision);
    if (filters?.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE}/audit?${params.toString()}`);
    return res.json();
  },

  async clearAuditLogs(): Promise<any> {
    const res = await fetch(`${API_BASE}/audit/clear`, { method: 'DELETE' });
    return res.json();
  },

  getAuditCsvExportUrl(): string {
    return `${API_BASE}/audit/export.csv`;
  },

  // Benchmark
  async getBenchmarkSummary(): Promise<BenchmarkMetrics> {
    const res = await fetch(`${API_BASE}/benchmark/summary`);
    return res.json();
  },

  getBenchmarkExportUrl(): string {
    return `${API_BASE}/benchmark/export.json`;
  }
};
