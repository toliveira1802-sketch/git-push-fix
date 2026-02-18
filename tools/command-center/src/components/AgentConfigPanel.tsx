/**
 * AgentConfigPanel - Slide-over para configurar agente
 * Muda LLM, modelo, temperatura, prompt, descricao
 */
import { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../hooks/useSupabase';
import type { IAAgent, LLMProvider } from '../types/ia';

interface AgentConfigPanelProps {
  agent: IAAgent;
  onClose: () => void;
  onSave: () => void;
}

const LLM_OPTIONS: { value: LLMProvider; label: string; color: string }[] = [
  { value: 'ollama', label: 'Ollama', color: 'text-blue-300 border-blue-500/50 bg-blue-500/10' },
  { value: 'claude', label: 'Claude', color: 'text-amber-300 border-amber-500/50 bg-amber-500/10' },
  { value: 'kimi', label: 'Kimi', color: 'text-violet-300 border-violet-500/50 bg-violet-500/10' },
  { value: 'local', label: 'Local', color: 'text-slate-300 border-slate-500/50 bg-slate-500/10' },
];

const INPUT_CLASS =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AgentConfigPanel({ agent, onClose, onSave }: AgentConfigPanelProps) {
  const [llmProvider, setLlmProvider] = useState<LLMProvider>(agent.llm_provider);
  const [modelo, setModelo] = useState(agent.modelo);
  const [temperatura, setTemperatura] = useState(String(agent.temperatura));
  const [promptSistema, setPromptSistema] = useState(agent.prompt_sistema ?? '');
  const [descricao, setDescricao] = useState(agent.descricao ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset on agent change
  useEffect(() => {
    setLlmProvider(agent.llm_provider);
    setModelo(agent.modelo);
    setTemperatura(String(agent.temperatura));
    setPromptSistema(agent.prompt_sistema ?? '');
    setDescricao(agent.descricao ?? '');
    setError(null);
    setSuccess(false);
  }, [agent.id, agent.llm_provider, agent.modelo, agent.temperatura, agent.prompt_sistema, agent.descricao]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const tempNum = parseFloat(temperatura);
    if (isNaN(tempNum) || tempNum < 0 || tempNum > 2) {
      setError('Temperatura deve ser entre 0 e 2');
      setSaving(false);
      return;
    }

    if (!modelo.trim()) {
      setError('Modelo e obrigatorio');
      setSaving(false);
      return;
    }

    const { error: err } = await supabase
      .from('ia_agents')
      .update({
        llm_provider: llmProvider,
        modelo: modelo.trim(),
        temperatura: tempNum,
        prompt_sistema: promptSistema.trim() || null,
        descricao: descricao.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agent.id);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      onSave();
      setTimeout(() => setSuccess(false), 2000);
    }
    setSaving(false);
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-100 truncate">{agent.nome}</h2>
            <p className="text-[10px] text-slate-500">Configurar agente • {agent.tipo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* LLM Provider */}
          <Field label="Provedor LLM">
            <div className="grid grid-cols-2 gap-2">
              {LLM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLlmProvider(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    llmProvider === opt.value
                      ? `${opt.color} ring-1 ring-purple-500/50`
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Modelo */}
          <Field label="Modelo">
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex: llama3.1:8b, claude-3-5-sonnet, kimi-2.5"
              className={INPUT_CLASS}
            />
            <p className="text-[10px] text-slate-600">
              {llmProvider === 'ollama' && 'Ollama: llama3.1:8b, mistral:7b, qwen2.5:14b'}
              {llmProvider === 'claude' && 'Claude: sonnet, haiku, opus'}
              {llmProvider === 'kimi' && 'Kimi: kimi-2.5, moonshot-v1-32k'}
              {llmProvider === 'local' && 'Local: cron-job, openclaw, chromadb'}
            </p>
          </Field>

          {/* Temperatura */}
          <Field label={`Temperatura — ${temperatura}`}>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)}
              className="w-full accent-purple-500 h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-600 px-0.5">
              <span>0 (preciso)</span>
              <span>1 (balanceado)</span>
              <span>2 (criativo)</span>
            </div>
          </Field>

          {/* Descricao */}
          <Field label="Descricao">
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descricao do agente"
              className={INPUT_CLASS}
            />
          </Field>

          {/* Prompt Sistema */}
          <Field label="Prompt Sistema">
            <textarea
              value={promptSistema}
              onChange={(e) => setPromptSistema(e.target.value)}
              rows={10}
              placeholder="Voce e uma IA especializada em..."
              className={`${INPUT_CLASS} resize-none font-mono text-xs leading-relaxed`}
            />
            <p className="text-[10px] text-slate-600">
              {promptSistema.length} caracteres
              {promptSistema.length > 2000 && (
                <span className="text-amber-400 ml-2">
                  (prompts muito longos podem reduzir qualidade)
                </span>
              )}
            </p>
          </Field>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              <p className="text-xs text-green-400">Salvo com sucesso!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white transition-colors"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </>
  );
}
