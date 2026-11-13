import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Search,
  RotateCcw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { AuditLogItem } from '../types';
import { api } from '../services/api';

interface AuditLogsPageProps {
  onNavigate?: (page: string) => void;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({
  onNavigate = () => {}
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({
        decision: decisionFilter || undefined,
        search: search || undefined
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [decisionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleDownloadCsv = () => {
    window.open(api.getAuditCsvExportUrl(), '_blank');
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all forensic audit records from SQLite database?')) return;
    try {
      await api.clearAuditLogs();
      await fetchLogs();
    } catch (err) {
      console.error('Clear logs failed:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="audit" onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Security Audit Logs</h1>
            <CyberBadge text="TAMPER-EVIDENT FORENSIC LEDGER" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Forensic record of every security gateway decision, latency, caller context, and policy citation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-border hover:border-rose-400 text-xs font-mono text-rose-600 transition-colors cursor-pointer shadow-sm"
            title="Clear logs for demo reset"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-white border border-ivory-border hover:border-olive-primary text-charcoal cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-olive-primary" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ivory-card p-5 flex flex-col md:flex-row gap-4 items-center justify-between text-xs font-mono">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brown-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Request ID, user, policy rule, or explanation..."
              className="w-full bg-white border border-ivory-border focus:border-olive-primary rounded-xl pl-10 pr-4 py-2.5 text-charcoal placeholder-brown-dark/60 focus:outline-none shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-ivory hover:bg-ivory-border/50 border border-ivory-border text-charcoal font-semibold cursor-pointer shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-brown-dark font-bold">Filter Decision:</span>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-white border border-ivory-border text-charcoal rounded-xl p-2.5 focus:outline-none focus:border-olive-primary shadow-sm"
          >
            <option value="">All Decisions</option>
            <option value="ALLOWED">ALLOWED</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="REQUIRES_CONFIRMATION">REQUIRES_CONFIRMATION</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="ivory-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ivory/80 text-brown-dark border-b border-ivory-border font-bold">
              <tr>
                <th className="py-4 px-5">Timestamp (UTC)</th>
                <th className="py-4 px-5">Request ID</th>
                <th className="py-4 px-5">Caller (Role)</th>
                <th className="py-4 px-5">Target Tool</th>
                <th className="py-4 px-5">Decision</th>
                <th className="py-4 px-5">Policy Rule</th>
                <th className="py-4 px-5">Latency</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-brown-dark font-medium">
                    Loading forensic audit trail from SQLite database...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-brown-dark font-medium">
                    No audit records found. Run queries in AI Playground or Attack Lab to generate records.
                  </td>
                </tr>
              ) : (
                logs.map((audit) => (
                  <tr key={audit.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-4 px-5 text-brown-dark font-medium whitespace-nowrap">
                      {audit.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-4 px-5 text-olive-primary font-mono font-semibold whitespace-nowrap">
                      {audit.request_id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-5 text-charcoal whitespace-nowrap">
                      {audit.user_id} ({audit.user_role})
                    </td>
                    <td className="py-4 px-5 text-charcoal font-bold whitespace-nowrap">
                      {audit.requested_tool}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <CyberBadge
                        text={audit.decision}
                        variant={
                          audit.decision === 'ALLOWED'
                            ? 'green'
                            : audit.decision === 'BLOCKED'
                            ? 'red'
                            : 'amber'
                        }
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-5 text-brown-warm font-semibold whitespace-nowrap">
                      {audit.policy_rule}
                    </td>
                    <td className="py-4 px-5 text-brown-dark font-medium whitespace-nowrap">
                      {audit.execution_time_ms} ms
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAudit(audit)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-ivory border border-ivory-border text-olive-primary text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="ivory-card p-8 max-w-lg w-full space-y-5 border-olive-primary/40 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-olive-primary" />
                <h3 className="text-base font-bold text-charcoal">Audit Record Forensic Ledger</h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-charcoal hover:bg-ivory px-3 py-1.5 bg-white border border-ivory-border rounded-lg cursor-pointer shadow-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-ivory border border-ivory-border space-y-2">
                <div><span className="text-brown-dark font-bold">REQUEST ID:</span> <span className="text-olive-primary font-mono font-semibold">{selectedAudit.request_id}</span></div>
                <div><span className="text-brown-dark font-bold">SESSION ID:</span> <span className="text-charcoal">{selectedAudit.session_id}</span></div>
                <div><span className="text-brown-dark font-bold">TIMESTAMP:</span> <span className="text-charcoal">{selectedAudit.timestamp}</span></div>
                <div><span className="text-brown-dark font-bold">CALLER:</span> <span className="text-charcoal">{selectedAudit.user_id} (Role: {selectedAudit.user_role})</span></div>
                <div><span className="text-brown-dark font-bold">TARGET TOOL:</span> <span className="text-charcoal font-bold">{selectedAudit.requested_tool}</span></div>
                <div><span className="text-brown-dark font-bold">PROTECTED MODE:</span> <span className="text-charcoal">{selectedAudit.protected_mode ? 'YES' : 'NO'}</span></div>
                <div><span className="text-brown-dark font-bold">LATENCY:</span> <span className="text-charcoal">{selectedAudit.execution_time_ms} ms</span></div>
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Security Decision:</span>
                <CyberBadge
                  text={selectedAudit.decision}
                  variant={selectedAudit.decision === 'ALLOWED' ? 'green' : 'red'}
                />
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Enforced Policy Rule:</span>
                <div className="p-3 rounded-xl bg-ivory border border-ivory-border text-brown-warm font-semibold">
                  {selectedAudit.policy_rule}
                </div>
              </div>

              <div>
                <span className="text-brown-dark block mb-1 font-bold uppercase">Technical Rationale &amp; Explanation:</span>
                <p className="p-3 rounded-xl bg-white border border-ivory-border text-charcoal leading-relaxed text-xs shadow-sm">
                  {selectedAudit.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
