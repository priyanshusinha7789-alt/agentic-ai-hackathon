import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Filter,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { Breadcrumb } from '../components/Breadcrumb';
import { SimulationScenario, SimulationResult } from '../types';
import { api } from '../services/api';

interface AttackLabPageProps {
  protectedMode: boolean;
  onToggleProtectedMode: () => void;
  onNavigate?: (page: string) => void;
}

export const AttackLabPage: React.FC<AttackLabPageProps> = ({
  protectedMode,
  onToggleProtectedMode,
  onNavigate = () => {}
}) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [results, setResults] = useState<Record<string, SimulationResult>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeResultModal, setActiveResultModal] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const scens = await api.getScenarios();
        setScenarios(scens);
      } catch (err) {
        console.error('Error loading scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRunTest = async (scenarioId: string) => {
    try {
      setRunningId(scenarioId);
      const res = await api.runSimulation(scenarioId, protectedMode);
      setResults((prev) => ({ ...prev, [scenarioId]: res }));
    } catch (err) {
      console.error(`Failed to execute test ${scenarioId}:`, err);
    } finally {
      setRunningId(null);
    }
  };

  const handleRunAllTests = async () => {
    try {
      setRunningAll(true);
      const allResults = await api.runAllSimulations(protectedMode);
      const resultMap: Record<string, SimulationResult> = {};
      allResults.forEach((r) => {
        resultMap[r.scenario_id] = r;
      });
      setResults(resultMap);
    } catch (err) {
      console.error('Failed to run batch simulation:', err);
    } finally {
      setRunningAll(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(scenarios.map((s) => s.category)))];

  const filteredScenarios = scenarios.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-[#F7F5EF] text-charcoal min-h-full w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb currentPage="attack-lab" onNavigate={onNavigate} />

      {/* Top Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ivory-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-charcoal tracking-tight">Attack Simulation Lab</h1>
            <CyberBadge text="CONTROLLED STRESS-TEST LAB" variant="olive" />
          </div>
          <p className="text-sm text-brown-dark font-mono font-medium mt-1">
            Test AgentShield AI against real-world agent attack vectors using synthetic datasets and isolated mock tools.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Indicator & Switch */}
          <button
            onClick={onToggleProtectedMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold border-2 transition-all cursor-pointer shadow-sm ${
              protectedMode
                ? 'bg-white text-olive-deep border-olive-primary hover:bg-olive-subtle/30 shadow-card-subtle'
                : 'bg-rose-50 text-rose-800 border-rose-500 hover:bg-rose-100 shadow-card-subtle'
            }`}
          >
            {protectedMode ? (
              <>
                <ShieldCheck className="w-4 h-4 text-olive-primary" />
                <span>Protected Mode Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-700 animate-pulse" />
                <span>Unprotected Simulation Mode</span>
              </>
            )}
          </button>

          {/* Batch Run Button */}
          <button
            onClick={handleRunAllTests}
            disabled={runningAll || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-primary hover:bg-olive-deep text-white font-bold text-xs font-mono shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${runningAll ? 'animate-spin' : ''}`} />
            <span>{runningAll ? 'Executing Scenarios...' : 'Run All 8 Attack Tests'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-brown-dark shrink-0" />
        <span className="text-xs font-mono text-charcoal shrink-0 font-bold">Filter Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer font-bold ${
              selectedCategory === cat
                ? 'bg-olive-primary text-white shadow-sm border border-olive-primary'
                : 'bg-white text-brown-dark hover:text-charcoal border border-ivory-border hover:border-olive-muted shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredScenarios.map((scenario) => {
          const result = results[scenario.id];
          const isRunning = runningId === scenario.id || runningAll;
          const isBenign = scenario.category === 'Benign Request';

          return (
            <div
              key={scenario.id}
              className={`ivory-card p-6 space-y-5 flex flex-col justify-between transition-all duration-300 bg-white border border-ivory-border shadow-card-subtle text-charcoal ${
                result
                  ? result.status === 'PASSED'
                    ? 'border-olive-primary/50 bg-olive-subtle/20'
                    : 'border-brown-warm/50 bg-brown-subtle/20'
                  : ''
              }`}
            >
              <div className="space-y-4">
                {/* Header with Coordinated Icon Container */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                      isBenign
                        ? 'bg-sage-light border-olive-primary/30 text-olive-deep'
                        : scenario.severity === 'CRITICAL'
                        ? 'bg-terracotta-subtle border-terracotta/30 text-terracotta'
                        : scenario.severity === 'HIGH'
                        ? 'bg-beige border-brown-warm/30 text-brown-warm'
                        : 'bg-gold-subtle border-gold/30 text-gold-dark'
                    }`}>
                      {isBenign ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-olive-deep font-bold">{scenario.id}</span>
                      <h3 className="text-base font-bold text-charcoal mt-0.5">{scenario.title}</h3>
                    </div>
                  </div>
                  <CyberBadge
                    text={scenario.severity}
                    variant={
                      scenario.severity === 'CRITICAL'
                        ? 'terracotta'
                        : scenario.severity === 'HIGH'
                        ? 'brown'
                        : isBenign
                        ? 'sage'
                        : 'olive'
                    }
                    size="sm"
                  />
                </div>

                <p className="text-xs sm:text-sm text-brown-dark leading-relaxed font-sans font-medium">{scenario.description}</p>

                {/* Attack Payload Snippet */}
                <div className="p-4 rounded-xl bg-ivory border border-ivory-border space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs text-charcoal font-bold">
                    <span>Attack Payload</span>
                    <span className="text-brown-dark font-medium">Target: {scenario.target_tool}</span>
                  </div>
                  <code className="text-xs text-brown-dark block break-words font-semibold">
                    "{scenario.attack_payload}"
                  </code>
                </div>

                {/* Expected Outcome */}
                <div className="text-xs font-mono space-y-1 pt-1 text-charcoal">
                  <div>
                    <span className="text-olive-deep font-bold">Protected Expectation: </span>
                    <span className="font-medium text-brown-dark">{scenario.expected_outcome_protected}</span>
                  </div>
                </div>

                {/* Execution Result (if run) */}
                {result && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                      result.status === 'PASSED'
                        ? 'bg-olive-subtle/60 border-olive-primary/40 text-olive-deep'
                        : 'bg-brown-subtle/60 border-brown-warm/40 text-brown-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        {result.status === 'PASSED' ? (
                          <CheckCircle2 className="w-4 h-4 text-olive-primary" />
                        ) : (
                          <XCircle className="w-4 h-4 text-brown-warm" />
                        )}
                        <span>Verdict: {result.status}</span>
                      </span>
                      <span className="text-xs font-bold text-charcoal">{result.execution_time_ms} ms</span>
                    </div>
                    <p className="text-xs leading-relaxed text-charcoal font-medium">{result.explanation}</p>
                    <button
                      onClick={() => setActiveResultModal(result)}
                      className="text-xs text-olive-deep hover:text-olive-primary hover:underline pt-1 block cursor-pointer font-bold"
                    >
                      Inspect Full Agent Output &amp; Forensics ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-ivory-border flex items-center justify-between">
                <span className="text-xs font-mono text-brown-dark font-bold">
                  {result ? `Decision: ${result.decision}` : 'Status: NOT EXECUTED'}
                </span>

                <button
                  onClick={() => handleRunTest(scenario.id)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ivory hover:bg-white border border-ivory-border hover:border-olive-primary text-xs font-mono text-olive-deep font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Run Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forensic Modal View */}
      {activeResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
          <div className="ivory-card p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 border border-ivory-border bg-white shadow-2xl rounded-2xl text-charcoal">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-olive-primary" />
                <h3 className="text-lg font-bold text-charcoal">{activeResultModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveResultModal(null)}
                className="text-charcoal font-mono text-xs px-3 py-1.5 rounded-lg bg-ivory hover:bg-white border border-ivory-border cursor-pointer font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-ivory border border-ivory-border">
                <div>
                  <span className="text-brown-dark font-bold block text-xs">SECURITY MODE:</span>
                  <span className={activeResultModal.protected_mode ? 'text-olive-deep font-bold' : 'text-rose-700 font-bold'}>
                    {activeResultModal.protected_mode ? 'Protected Gateway' : 'Unprotected Simulation'}
                  </span>
                </div>
                <div>
                  <span className="text-brown-dark font-bold block text-xs">GATEWAY LATENCY:</span>
                  <span className="text-charcoal font-bold">{activeResultModal.execution_time_ms} ms</span>
                </div>
              </div>

              <div>
                <span className="text-charcoal font-bold block mb-1">Payload Evaluated:</span>
                <pre className="p-3.5 rounded-xl bg-ivory border border-ivory-border text-xs text-brown-dark font-semibold whitespace-pre-wrap">
                  {activeResultModal.payload_used}
                </pre>
              </div>

              <div>
                <span className="text-charcoal font-bold block mb-1">Agent Response / Gateway Output:</span>
                <pre className="p-3.5 rounded-xl bg-ivory border border-ivory-border text-xs text-charcoal font-medium whitespace-pre-wrap">
                  {activeResultModal.agent_output}
                </pre>
              </div>

              <div>
                <span className="text-charcoal font-bold block mb-1">Technical Defense Rationale:</span>
                <p className="text-charcoal text-xs leading-relaxed p-3.5 rounded-xl bg-ivory border border-ivory-border font-medium">
                  {activeResultModal.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
