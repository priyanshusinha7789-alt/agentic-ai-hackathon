import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { DashboardStats } from '../types';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  protectedMode: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, protectedMode }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningBatch, setRunningBatch] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunBaselineSuite = async () => {
    try {
      setRunningBatch(true);
      await api.runAllSimulations(protectedMode);
      await fetchStats();
    } catch (err) {
      console.error('Error running baseline suite:', err);
    } finally {
      setRunningBatch(false);
    }
  };

  // Refined Olive, Brown, Terracotta, Gold & Sage Chart Palette
  const CHART_COLORS = ['#68734A', '#80634B', '#B56F50', '#C49A52', '#A6B18A', '#343B2B', '#514234', '#858B68'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-ivory">
        <div className="w-10 h-10 border-2 border-olive-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-olive-deep font-semibold">Loading Telemetry from AgentShield SQLite DB...</p>
      </div>
    );
  }

  const hasData = stats && (stats.total_tests_executed > 0 || stats.recent_audit_events.length > 0);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="dashboard" onNavigate={onNavigate} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Security Telemetry Dashboard</h1>
            <CyberBadge text="SQLITE BACKED" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Real-time security intelligence and telemetry aggregated directly from active AgentShield Gateway records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-border hover:border-olive-primary text-xs font-mono text-charcoal shadow-card-subtle transition-all cursor-pointer font-semibold"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-olive-primary' : 'text-brown-dark'}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={handleRunBaselineSuite}
            disabled={runningBatch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-primary hover:bg-olive-deep text-xs font-mono text-white font-bold shadow-md transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${runningBatch ? 'animate-spin' : ''}`} />
            <span>{runningBatch ? 'Executing Test Suite...' : 'Run Attack Suite Now'}</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Security Tests"
          value={stats?.total_tests_executed || 0}
          subtitle="Simulation scenarios executed"
          icon={Activity}
          color="gold"
        />
        <StatCard
          title="Detected Malicious Inputs"
          value={stats?.detected_malicious_inputs || 0}
          subtitle="Injections &amp; exploits intercepted"
          icon={ShieldAlert}
          color="terracotta"
        />
        <StatCard
          title="Blocked Actions"
          value={stats?.blocked_unauthorised_actions || 0}
          subtitle="Denied by gateway policies"
          icon={AlertTriangle}
          color="brown"
        />
        <StatCard
          title="Allowed Safe Requests"
          value={stats?.allowed_safe_requests || 0}
          subtitle="Verified benign operations"
          icon={ShieldCheck}
          color="sage"
        />
      </div>

      {/* Empty State Warning if 0 tests */}
      {!hasData && (
        <div className="p-12 rounded-2xl ivory-card border-dashed border-olive-primary/30 text-center space-y-5 bg-white text-charcoal">
          <div className="w-16 h-16 rounded-2xl bg-olive-primary/10 border border-olive-primary/30 flex items-center justify-center mx-auto text-olive-primary">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-charcoal">No Telemetry Recorded Yet</h3>
          <p className="text-sm text-brown-dark font-medium max-w-lg mx-auto leading-relaxed">
            AgentShield displays only authentic metrics computed directly from database executions. 
            Click the button below to run the complete 8-scenario attack suite and populate telemetry immediately.
          </p>
          <button
            onClick={handleRunBaselineSuite}
            disabled={runningBatch}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs font-mono shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 text-white" />
            <span>Run Complete Attack Simulation Suite</span>
          </button>
        </div>
      )}

      {/* Analytics Charts Grid */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Threat Category Distribution Chart */}
          <div className="ivory-card p-8 space-y-4 bg-white border border-ivory-border rounded-2xl shadow-card-subtle text-charcoal">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <div>
                <h3 className="text-base font-bold text-charcoal">Threat Category Distribution</h3>
                <p className="text-xs text-brown-dark font-mono font-medium mt-0.5">Classification of intercepted attack vectors</p>
              </div>
              <CyberBadge text="REAL DATA" variant="brown" size="sm" />
            </div>

            <div className="h-72 w-full">
              {stats?.attack_category_distribution && stats.attack_category_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.attack_category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.attack_category_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E1D7',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#25271F',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#514234' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-mono text-brown-dark font-medium">
                  Run attack tests to render category distribution.
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Chart */}
          <div className="ivory-card p-8 space-y-4 bg-white border border-ivory-border rounded-2xl shadow-card-subtle text-charcoal">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
              <div>
                <h3 className="text-base font-bold text-charcoal">Security Gateway Activity Timeline</h3>
                <p className="text-xs text-brown-dark font-mono font-medium mt-0.5">Enforcement velocity over recent audit windows</p>
              </div>
              <CyberBadge text="DECISION VELOCITY" variant="olive" size="sm" />
            </div>

            <div className="h-72 w-full">
              {stats?.security_activity_timeline && stats.security_activity_timeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.security_activity_timeline}>
                    <defs>
                      <linearGradient id="colorBlockedOlive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B56F50" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#B56F50" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAllowedOlive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#68734A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#68734A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D7" />
                    <XAxis dataKey="timestamp" stroke="#514234" fontSize={10} tickFormatter={(val) => val.split('T')[1] || val} />
                    <YAxis stroke="#514234" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E1D7',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#25271F',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Area type="monotone" dataKey="blocked" name="Blocked (Threats)" stroke="#B56F50" strokeWidth={2} fillOpacity={1} fill="url(#colorBlockedOlive)" />
                    <Area type="monotone" dataKey="allowed" name="Allowed (Safe)" stroke="#68734A" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowedOlive)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-mono text-brown-dark font-medium">
                  Waiting for audit activity events to generate timeline.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Threat Alerts & Audit Events */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Threat Alerts */}
          <div className="ivory-card p-8 space-y-5 bg-white border border-ivory-border rounded-2xl shadow-card-subtle text-charcoal">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-subtle border border-terracotta/30 flex items-center justify-center text-terracotta">
                  <AlertTriangle className="w-5 h-5 text-terracotta" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal">Recent Security Threats Intercepted</h3>
                  <p className="text-[11px] font-mono text-brown-dark font-medium">Real-time attack vector telemetry</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('threats')}
                className="text-xs font-mono text-olive-deep hover:text-olive-primary font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>View All Threats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {stats?.recent_threats && stats.recent_threats.length > 0 ? (
                stats.recent_threats.map((threat) => (
                  <div key={threat.id} className="p-4 rounded-xl bg-ivory border border-ivory-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal text-sm">{threat.threat_category}</span>
                      <CyberBadge text={threat.severity} variant={threat.severity === 'CRITICAL' ? 'red' : 'brown'} size="sm" />
                    </div>
                    <p className="text-brown-dark font-mono text-xs leading-relaxed font-medium">{threat.reason}</p>
                    <div className="flex items-center justify-between text-xs text-charcoal font-mono pt-1 border-t border-ivory-border font-medium">
                      <span>Target: <span className="font-bold">{threat.requested_action}</span></span>
                      <span>Decision: <span className="text-rose-800 font-bold">{threat.decision}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brown-dark font-mono py-6 text-center font-medium">No threats recorded yet.</p>
              )}
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="ivory-card p-8 space-y-5 bg-white border border-ivory-border rounded-2xl shadow-card-subtle text-charcoal">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-light border border-olive-primary/30 flex items-center justify-center text-olive-deep">
                  <Clock className="w-5 h-5 text-olive-deep" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-charcoal">Recent Gateway Audit Ledger</h3>
                  <p className="text-[11px] font-mono text-brown-dark font-medium">Immutable SQLite enforcement stream</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-mono text-olive-deep hover:text-olive-primary font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {stats?.recent_audit_events && stats.recent_audit_events.length > 0 ? (
                stats.recent_audit_events.map((audit) => (
                  <div key={audit.id} className="p-4 rounded-xl bg-ivory border border-ivory-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-olive-deep text-xs font-bold">{audit.requested_tool}</span>
                      <CyberBadge text={audit.decision} variant={audit.decision === 'ALLOWED' ? 'green' : 'red'} size="sm" />
                    </div>
                    <p className="text-brown-dark text-xs leading-relaxed font-medium">{audit.explanation}</p>
                    <div className="flex items-center justify-between text-xs text-charcoal font-mono pt-1 border-t border-ivory-border font-medium">
                      <span>Latency: <span className="font-bold">{audit.execution_time_ms} ms</span></span>
                      <span>Rule: <span className="font-bold text-brown-dark">{audit.policy_rule}</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-brown-dark font-mono py-6 text-center font-medium">No audit records recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
