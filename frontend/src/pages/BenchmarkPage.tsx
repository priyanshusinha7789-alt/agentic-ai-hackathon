import React, { useState, useEffect } from 'react';
import {
  Download,
  ShieldCheck,
  RotateCcw,
  Activity,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { StatCard } from '../components/StatCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { BenchmarkMetrics } from '../types';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface BenchmarkPageProps {
  onNavigate?: (page: string) => void;
}

export const BenchmarkPage: React.FC<BenchmarkPageProps> = ({
  onNavigate = () => {}
}) => {
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBenchmarkData = async () => {
    try {
      setLoading(true);
      const data = await api.getBenchmarkSummary();
      setMetrics(data);
      const hist = await api.getSimulationHistory();
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load benchmark metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, []);

  const handleDownloadReport = () => {
    window.open(api.getBenchmarkExportUrl(), '_blank');
  };

  const chartData = [
    {
      name: 'Attack Defense',
      Protected: metrics?.blocking_rate_pct || 0,
      Unprotected: 0.0
    },
    {
      name: 'Benign Accuracy',
      Protected: metrics ? 100 - metrics.false_positive_rate_pct : 0,
      Unprotected: 100.0
    },
    {
      name: 'Precision',
      Protected: metrics?.precision_pct || 0,
      Unprotected: 0.0
    },
    {
      name: 'Recall',
      Protected: metrics?.recall_pct || 0,
      Unprotected: 0.0
    }
  ];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-10 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="benchmark" onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Security Evaluation &amp; Benchmarking</h1>
            <CyberBadge text="EMPIRICAL METRICS" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Empirical evaluation comparing Protected Mode vs Unprotected Simulation calculated strictly from executed test runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Evaluation JSON</span>
          </button>

          <button
            onClick={fetchBenchmarkData}
            className="p-2.5 rounded-xl bg-white border border-ivory-border hover:border-olive-primary text-charcoal cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-olive-primary" />
          </button>
        </div>
      </div>

      {/* Primary Benchmark Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Blocking Rate"
          value={`${metrics?.blocking_rate_pct || 0}%`}
          subtitle="True Positives / Malicious Tests"
          icon={ShieldCheck}
          color="sage"
        />
        <StatCard
          title="False Positive Rate"
          value={`${metrics?.false_positive_rate_pct || 0}%`}
          subtitle="Incorrectly Blocked / Benign Tests"
          icon={CheckCircle2}
          color="gold"
        />
        <StatCard
          title="F1 Security Score"
          value={`${metrics?.f1_score_pct || 0}%`}
          subtitle="Harmonic mean of Precision &amp; Recall"
          icon={Activity}
          color="olive"
        />
        <StatCard
          title="Avg Decision Latency"
          value={`${metrics?.avg_decision_time_ms || 0} ms`}
          subtitle="Gateway enforcement overhead"
          icon={Clock}
          color="brown"
        />
      </div>

      {/* Mathematical Rigor & Metric Definitions */}
      <div className="ivory-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold font-mono text-olive-primary">
          <HelpCircle className="w-5 h-5" />
          <span>Evaluation Metrics Formulation & Denominators</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div className="p-4 rounded-xl bg-ivory/60 border border-ivory-border space-y-2">
            <span className="text-charcoal font-bold text-sm block">Attack Blocking Rate</span>
            <div className="text-olive-deep font-bold text-xs font-mono">
              = Blocked Malicious / (Blocked + Missed Malicious)
            </div>
            <p className="text-[11px] text-brown-dark font-medium leading-relaxed">Denominator: Total malicious attack scenarios executed ({metrics?.malicious_tests || 0}).</p>
          </div>

          <div className="p-4 rounded-xl bg-ivory/60 border border-ivory-border space-y-2">
            <span className="text-charcoal font-bold text-sm block">False Positive Rate</span>
            <div className="text-brown-warm font-bold text-xs font-mono">
              = Incorrectly Blocked Benign / Total Benign Tests
            </div>
            <p className="text-[11px] text-brown-dark font-medium leading-relaxed">Denominator: Total legitimate benign queries evaluated ({metrics?.benign_tests || 0}).</p>
          </div>

          <div className="p-4 rounded-xl bg-ivory/60 border border-ivory-border space-y-2">
            <span className="text-charcoal font-bold text-sm block">Precision &amp; Recall</span>
            <div className="text-olive-deep font-bold text-xs font-mono">
              Precision = TP / (TP + FP) | Recall = TP / (TP + FN)
            </div>
            <p className="text-[11px] text-brown-dark font-medium leading-relaxed">TP: {metrics?.blocked_malicious || 0} | FN: {metrics?.failed_unauthorised || 0} | FP: {metrics?.incorrectly_blocked_benign || 0}</p>
          </div>
        </div>
      </div>

      {/* Comparison Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparison Chart */}
        <div className="ivory-card p-8 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-ivory-border">
            <h3 className="text-base font-bold text-charcoal">Protected vs. Unprotected Benchmark</h3>
            <CyberBadge text="COMPARATIVE EFFICACY" variant="olive" size="sm" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D7" />
                <XAxis dataKey="name" stroke="#77776C" fontSize={11} />
                <YAxis stroke="#77776C" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E1D7',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#25271F',
                    boxShadow: '0 4px 12px rgba(37,39,31,0.08)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="Protected" name="AgentShield Protected (%)" fill="#68734A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Unprotected" name="Unprotected Baseline (%)" fill="#80634B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="ivory-card p-8 space-y-5 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-border">
            <h3 className="text-base font-bold text-charcoal">Defense Comparison Matrix</h3>
            <CyberBadge text="VERIFIED RESULTS" variant="brown" size="sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-ivory/80 text-brown-dark border-b border-ivory-border font-bold">
                <tr>
                  <th className="py-3 px-4">Evaluation Dimension</th>
                  <th className="py-3 px-4 text-olive-primary font-bold">AgentShield Protected</th>
                  <th className="py-3 px-4 text-brown-warm font-bold">Unprotected Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-border">
                {metrics?.protected_vs_unprotected_comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-ivory/40">
                    <td className="py-3 px-4 text-charcoal font-semibold">{row.metric}</td>
                    <td className="py-3 px-4 text-olive-deep font-bold">{row["AgentShield Protected"]}</td>
                    <td className="py-3 px-4 text-brown-dark font-medium">{row["Unprotected Baseline"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Execution History */}
      <div className="ivory-card p-8 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-olive-primary" />
            <h3 className="text-base font-bold text-charcoal">Recent Test Execution History</h3>
          </div>
          <span className="text-xs font-mono text-brown-dark font-medium">Total Run Records: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ivory/80 text-brown-dark border-b border-ivory-border font-bold">
              <tr>
                <th className="py-3 px-4">Scenario ID</th>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-border">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brown-dark font-medium">
                    No simulation history. Run scenarios from Attack Lab to record benchmark trials.
                  </td>
                </tr>
              ) : (
                history.slice(0, 10).map((h) => (
                  <tr key={h.id} className="hover:bg-ivory/40">
                    <td className="py-3 px-4 text-olive-primary font-bold">{h.scenario_id}</td>
                    <td className="py-3 px-4 text-charcoal font-medium">{h.title}</td>
                    <td className="py-3 px-4">
                      <CyberBadge
                        text={h.protected_mode ? 'PROTECTED' : 'UNPROTECTED'}
                        variant={h.protected_mode ? 'olive' : 'red'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <CyberBadge
                        text={h.status}
                        variant={h.status === 'PASSED' ? 'green' : 'red'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-charcoal">{h.decision}</td>
                    <td className="py-3 px-4 text-brown-dark font-medium">{h.execution_time_ms} ms</td>
                    <td className="py-3 px-4 text-brown-dark font-medium">{h.timestamp.split('T')[1]?.substring(0, 8)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
