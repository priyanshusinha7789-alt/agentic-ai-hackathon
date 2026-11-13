import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  RotateCcw,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { ThreatItem, ThreatSeverity } from '../types';
import { api } from '../services/api';

interface ThreatExplorerPageProps {
  onNavigate?: (page: string) => void;
}

export const ThreatExplorerPage: React.FC<ThreatExplorerPageProps> = ({
  onNavigate = () => {}
}) => {
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeThreat, setActiveThreat] = useState<ThreatItem | null>(null);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const data = await api.getThreats({
        severity: severityFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined
      });
      setThreats(data);
    } catch (err) {
      console.error('Failed to load threats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [severityFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchThreats();
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="threats" onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Threat Explorer</h1>
            <CyberBadge text="FORENSIC INCIDENT LOGS" variant="terracotta" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Real-time repository of detected prompt manipulations, jailbreak attempts, and unauthorized tool calls.
          </p>
        </div>

        <button
          onClick={fetchThreats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-border hover:border-olive-primary text-xs font-mono text-charcoal transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-olive-primary" />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="ivory-card p-5 flex flex-col md:flex-row gap-4 items-center justify-between text-xs font-mono">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brown-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reason, action, or payload snippet..."
              className="w-full bg-white border border-ivory-border focus:border-olive-primary rounded-xl pl-10 pr-4 py-2.5 text-charcoal placeholder-brown-dark/60 focus:outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-ivory hover:bg-ivory-border/50 border border-ivory-border text-charcoal cursor-pointer font-semibold shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-brown-dark font-bold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-ivory-border text-charcoal rounded-xl p-2.5 focus:outline-none focus:border-olive-primary shadow-sm"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-brown-dark font-bold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-ivory-border text-charcoal rounded-xl p-2.5 focus:outline-none focus:border-olive-primary shadow-sm max-w-[200px]"
            >
              <option value="">All Categories</option>
              <option value="Direct Prompt Injection">Direct Prompt Injection</option>
              <option value="Indirect Prompt Injection">Indirect Prompt Injection</option>
              <option value="Unauthorised Tool Call">Unauthorised Tool Call</option>
              <option value="Cross-User Data Access (IDOR)">Cross-User Data Access (IDOR)</option>
              <option value="Malformed Tool Argument">Malformed Tool Argument</option>
              <option value="Sensitive Data Exposure">Sensitive Data Exposure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threats Table */}
      <div className="ivory-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ivory/80 text-brown-dark border-b border-ivory-border font-bold">
              <tr>
                <th className="py-4 px-5">Time (UTC)</th>
                <th className="py-4 px-5">Threat Category</th>
                <th className="py-4 px-5">Severity</th>
                <th className="py-4 px-5">Target Action</th>
                <th className="py-4 px-5">Decision</th>
                <th className="py-4 px-5">Interception Rationale</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brown-dark font-medium">
                    Loading threat incidents from SQLite...
                  </td>
                </tr>
              ) : threats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-brown-dark font-medium">
                    No threat incidents recorded. Run attack scenarios in Attack Lab to generate threat records.
                  </td>
                </tr>
              ) : (
                threats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-4 px-5 text-brown-dark font-medium whitespace-nowrap">
                      {threat.timestamp.split('T')[1]?.substring(0, 8) || threat.timestamp}
                    </td>
                    <td className="py-4 px-5 font-bold text-charcoal whitespace-nowrap">
                      {threat.threat_category}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <CyberBadge
                        text={threat.severity}
                        variant={threat.severity === 'CRITICAL' ? 'red' : 'amber'}
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-5 text-olive-deep font-mono font-semibold whitespace-nowrap">
                      {threat.requested_action}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <CyberBadge
                        text={threat.decision}
                        variant={threat.decision === 'BLOCKED' ? 'red' : 'amber'}
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-5 text-brown-dark font-medium max-w-xs truncate" title={threat.reason}>
                      {threat.reason}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveThreat(threat)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-ivory border border-ivory-border text-olive-primary cursor-pointer font-semibold shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Modal View */}
      {activeThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="ivory-card p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-5 border-rose-300 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-charcoal">Threat Incident Forensic Details</h3>
              </div>
              <button
                onClick={() => setActiveThreat(null)}
                className="text-charcoal hover:bg-ivory px-3 py-1 bg-white border border-ivory-border rounded-lg cursor-pointer shadow-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-ivory border border-ivory-border">
                <div>
                  <span className="text-brown-dark block text-[10px] uppercase font-bold">INCIDENT ID:</span>
                  <span className="text-olive-primary font-bold text-sm">#{activeThreat.id}</span>
                </div>
                <div>
                  <span className="text-brown-dark block text-[10px] uppercase font-bold">TIMESTAMP:</span>
                  <span className="text-charcoal">{activeThreat.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="text-brown-dark block text-[10px] uppercase font-bold">ORIGIN CALLER:</span>
                  <span className="text-charcoal">{activeThreat.user_id} ({activeThreat.user_role})</span>
                </div>
                <div className="mt-2">
                  <span className="text-brown-dark block text-[10px] uppercase font-bold">SEVERITY:</span>
                  <CyberBadge text={activeThreat.severity} variant={activeThreat.severity === 'CRITICAL' ? 'red' : 'amber'} size="sm" />
                </div>
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Target Action:</span>
                <div className="p-3 rounded-xl bg-ivory border border-ivory-border text-charcoal font-semibold text-sm">
                  {activeThreat.requested_action}
                </div>
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Detection Reason &amp; Policy Violation:</span>
                <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 leading-relaxed text-xs">
                  {activeThreat.reason}
                </p>
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Captured Payload Snippet:</span>
                <pre className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 whitespace-pre-wrap break-all shadow-inner">
                  {activeThreat.payload_snippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
