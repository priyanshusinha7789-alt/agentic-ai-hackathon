import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { PolicyRule, UserRole } from '../types';
import { api } from '../services/api';

interface PolicyCentrePageProps {
  onNavigate?: (page: string) => void;
}

export const PolicyCentrePage: React.FC<PolicyCentrePageProps> = ({
  onNavigate = () => {}
}) => {
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<PolicyRule>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const data = await api.getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Failed to load policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleStartEdit = (policy: PolicyRule) => {
    setEditingId(policy.id);
    setEditForm({
      sensitivity_level: policy.sensitivity_level,
      min_required_role: policy.min_required_role,
      requires_confirmation: policy.requires_confirmation,
      is_enabled: policy.is_enabled,
      pii_filtering_enabled: policy.pii_filtering_enabled
    });
  };

  const handleSaveEdit = async (policyId: number) => {
    try {
      setSaving(true);
      const updated = await api.updatePolicy(policyId, editForm);
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? updated : p)));
      setEditingId(null);
      setStatusMessage(`Policy #${policyId} updated and persisted to SQLite database.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save policy:', err);
      alert('Error saving policy changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggleEnabled = async (policy: PolicyRule) => {
    try {
      const updated = await api.updatePolicy(policy.id, { is_enabled: !policy.is_enabled });
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
      setStatusMessage(`Tool '${policy.tool_name}' ${!policy.is_enabled ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all security policies to factory defaults?')) return;
    try {
      await api.resetPolicies();
      await fetchPolicies();
      setStatusMessage('All policies restored to baseline enterprise defaults.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="policies" onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Security Policy Centre</h1>
            <CyberBadge text="DYNAMIC RBAC &amp; GOVERNANCE" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Configure tool allowlists, role clearances, and confirmation constraints stored in SQLite backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-border hover:border-olive-primary text-xs font-mono text-charcoal transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-olive-primary" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-olive-primary/10 border border-olive-primary/30 text-olive-deep text-xs font-mono flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-olive-primary shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Policy List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-olive-primary">Loading active policies from SQLite...</div>
        ) : (
          policies.map((policy) => {
            const isEditing = editingId === policy.id;

            return (
              <div
                key={policy.id}
                className={`ivory-card p-6 sm:p-8 transition-all space-y-5 ${
                  !policy.is_enabled ? 'opacity-65 border-ivory-border' : 'border-ivory-border hover:border-olive-primary/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuickToggleEnabled(policy)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        policy.is_enabled ? 'bg-olive-primary' : 'bg-taupe/40'
                      }`}
                      title="Toggle Tool Status"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          policy.is_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-3">
                        <code className="text-base font-bold font-mono text-charcoal">{policy.tool_name}</code>
                        <CyberBadge
                          text={policy.is_enabled ? 'ENABLED' : 'DISABLED'}
                          variant={policy.is_enabled ? 'olive' : 'slate'}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-brown-dark font-medium mt-1">{policy.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(policy.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs font-mono transition-all cursor-pointer shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-xl bg-ivory border border-ivory-border text-xs font-mono text-brown-dark hover:text-charcoal font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(policy)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-ivory-border hover:border-olive-primary/50 text-xs font-mono text-olive-primary font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Policy</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Configuration Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4 border-t border-ivory-border text-xs font-mono">
                  {/* Sensitivity */}
                  <div className="space-y-1.5">
                    <span className="text-brown-dark text-xs uppercase font-bold tracking-wider">Sensitivity:</span>
                    {isEditing ? (
                      <select
                        value={editForm.sensitivity_level}
                        onChange={(e) => setEditForm({ ...editForm, sensitivity_level: e.target.value as any })}
                        className="w-full bg-white border border-ivory-border rounded-lg p-2 text-charcoal shadow-sm focus:border-olive-primary"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    ) : (
                      <div className="text-charcoal font-bold text-sm">{policy.sensitivity_level}</div>
                    )}
                  </div>

                  {/* Required Role */}
                  <div className="space-y-1.5">
                    <span className="text-brown-dark text-xs uppercase font-bold tracking-wider">Clearance:</span>
                    {isEditing ? (
                      <select
                        value={editForm.min_required_role}
                        onChange={(e) => setEditForm({ ...editForm, min_required_role: e.target.value as UserRole })}
                        className="w-full bg-white border border-ivory-border rounded-lg p-2 text-charcoal shadow-sm focus:border-olive-primary"
                      >
                        <option value="public">public</option>
                        <option value="tier1_agent">tier1_agent</option>
                        <option value="supervisor">supervisor</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <div className="text-olive-primary font-bold text-sm">{policy.min_required_role}</div>
                    )}
                  </div>

                  {/* Human Confirmation */}
                  <div className="space-y-1.5">
                    <span className="text-brown-dark text-xs uppercase font-bold tracking-wider">Confirmation:</span>
                    {isEditing ? (
                      <label className="flex items-center gap-2 pt-1 text-charcoal">
                        <input
                          type="checkbox"
                          checked={editForm.requires_confirmation}
                          onChange={(e) => setEditForm({ ...editForm, requires_confirmation: e.target.checked })}
                          className="rounded border-ivory-border text-olive-primary focus:ring-olive-primary"
                        />
                        <span>Require Token</span>
                      </label>
                    ) : (
                      <div className={policy.requires_confirmation ? 'text-brown-warm font-bold text-sm' : 'text-brown-dark font-medium text-sm'}>
                        {policy.requires_confirmation ? 'REQUIRED (Token Guard)' : 'None (Auto-approved)'}
                      </div>
                    )}
                  </div>

                  {/* PII Sanitization */}
                  <div className="space-y-1.5">
                    <span className="text-brown-dark text-xs uppercase font-bold tracking-wider">PII Scrubbing:</span>
                    {isEditing ? (
                      <label className="flex items-center gap-2 pt-1 text-charcoal">
                        <input
                          type="checkbox"
                          checked={editForm.pii_filtering_enabled}
                          onChange={(e) => setEditForm({ ...editForm, pii_filtering_enabled: e.target.checked })}
                          className="rounded border-ivory-border text-olive-primary focus:ring-olive-primary"
                        />
                        <span>Scrub Outputs</span>
                      </label>
                    ) : (
                      <div className={policy.pii_filtering_enabled ? 'text-olive-deep font-bold text-sm' : 'text-brown-dark font-medium text-sm'}>
                        {policy.pii_filtering_enabled ? 'ENFORCED' : 'OFF'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Constraints Snippet */}
                {Object.keys(policy.argument_constraints || {}).length > 0 && (
                  <div className="text-xs font-mono text-brown-dark font-medium pt-1">
                    Constraints: <code className="text-charcoal bg-ivory px-2 py-0.5 rounded border border-ivory-border">{JSON.stringify(policy.argument_constraints)}</code>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
