import { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Sparkles,
  Save,
  Upload,
  X,
  Check,
  RefreshCw,
  User,
  Palette,
} from 'lucide-react';
import { supabase } from '../hooks/useSupabase';
import type { IAAgent } from '../types/ia';

interface SophiaAvatarsProps {
  sophia: IAAgent | null;
  princesses: IAAgent[];
}

// Avatares pre-definidos (URLs de placeholder - pode trocar por reais)
const PRESET_AVATARS: Record<string, string[]> = {
  queen: [
    'https://api.dicebear.com/7.x/personas/svg?seed=sophia&backgroundColor=c084fc',
    'https://api.dicebear.com/7.x/personas/svg?seed=queen&backgroundColor=a855f7',
    'https://api.dicebear.com/7.x/personas/svg?seed=empress&backgroundColor=9333ea',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia&backgroundColor=c084fc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=sophia&backgroundColor=c084fc',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=sophia&backgroundColor=c084fc',
  ],
  princess: [
    'https://api.dicebear.com/7.x/personas/svg?seed=anna&backgroundColor=f472b6',
    'https://api.dicebear.com/7.x/personas/svg?seed=simone&backgroundColor=22d3ee',
    'https://api.dicebear.com/7.x/personas/svg?seed=thamy&backgroundColor=fbbf24',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=anna&backgroundColor=f472b6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=simone&backgroundColor=22d3ee',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=thamy&backgroundColor=fbbf24',
  ],
};

const PRINCESS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'Anna': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  'Simone': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  'Thamy': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

interface AgentAvatarEditorProps {
  agent: IAAgent;
  role: 'queen' | 'princess';
  onSave: (agentId: string, avatarUrl: string) => Promise<void>;
}

function AgentAvatarEditor({ agent, role, onSave }: AgentAvatarEditorProps) {
  const [avatarUrl, setAvatarUrl] = useState(agent.avatar_url || '');
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const colors = PRINCESS_COLORS[agent.nome] || { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
  const presets = role === 'queen' ? PRESET_AVATARS.queen : PRESET_AVATARS.princess;

  const handleSave = async () => {
    setSaving(true);
    await onSave(agent.id, avatarUrl);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectPreset = (url: string) => {
    setAvatarUrl(url);
    setShowPresets(false);
  };

  const applyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatarUrl(customUrl.trim());
      setCustomUrl('');
    }
  };

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start gap-4">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-2">
          <div className={`w-20 h-20 rounded-2xl border-2 ${colors.border} overflow-hidden bg-slate-800/60 flex items-center justify-center`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={agent.nome} className="w-20 h-20 rounded-2xl object-cover" />
            ) : role === 'queen' ? (
              <Crown size={32} className={colors.color} />
            ) : (
              <Sparkles size={32} className={colors.color} />
            )}
          </div>
          {avatarUrl && (
            <button
              onClick={() => setAvatarUrl('')}
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
            >
              Remover
            </button>
          )}
        </div>

        {/* Info & Controls */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {role === 'queen' ? (
              <Crown size={14} className={colors.color} />
            ) : (
              <Sparkles size={14} className={colors.color} />
            )}
            <h3 className={`text-sm font-bold ${colors.color}`}>{agent.nome}</h3>
            <span className="text-[10px] text-slate-600">
              {role === 'queen' ? 'Rainha' : 'Princesa'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            {agent.descricao || (role === 'queen' ? 'IA Mae - Cerebro Central' : `Princesa especializada de Sophia`)}
          </p>

          {/* Description editor */}
          <div className="mb-3">
            <label className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 block">
              Personalidade / Descricao
            </label>
            <textarea
              defaultValue={agent.descricao || ''}
              placeholder={`Descreva a personalidade de ${agent.nome}...`}
              className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
              rows={2}
              onBlur={async (e) => {
                await supabase
                  .from('ia_agents')
                  .update({ descricao: e.target.value })
                  .eq('id', agent.id);
              }}
            />
          </div>

          {/* Avatar URL Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Cole URL do avatar..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomUrl()}
              className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <button
              onClick={applyCustomUrl}
              disabled={!customUrl.trim()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/40 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 text-xs"
            >
              <Upload size={12} />
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                showPresets
                  ? `${colors.bg} ${colors.border} ${colors.color}`
                  : 'bg-slate-700/50 border-slate-600/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette size={12} />
            </button>
          </div>

          {/* Preset Avatars */}
          {showPresets && (
            <div className="grid grid-cols-6 gap-2 mb-3 p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
              {presets.map((url, i) => (
                <button
                  key={i}
                  onClick={() => selectPreset(url)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 ${
                    avatarUrl === url ? `${colors.border} ring-1 ring-purple-400` : 'border-slate-700/40'
                  }`}
                >
                  <img src={url} alt={`preset-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || avatarUrl === (agent.avatar_url || '')}
            className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-30 ${
              saved
                ? 'bg-green-600/20 border border-green-500/40 text-green-400'
                : `${colors.bg} border ${colors.border} ${colors.color} hover:opacity-80`
            }`}
          >
            {saved ? <Check size={12} /> : saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SophiaAvatars({ sophia, princesses }: SophiaAvatarsProps) {
  const handleSave = useCallback(async (agentId: string, avatarUrl: string) => {
    await supabase
      .from('ia_agents')
      .update({ avatar_url: avatarUrl || null })
      .eq('id', agentId);
  }, []);

  if (!sophia) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <User size={28} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">Sophia nao encontrada</p>
          <p className="text-xs text-slate-600 mt-1">Configure a Rainha na tabela ia_agents</p>
        </div>
      </div>
    );
  }

  // Princesas esperadas (mesmo se nao existem no banco ainda)
  const expectedPrincesses = ['Anna', 'Simone', 'Thamy'];
  const existingNames = princesses.map(p => p.nome);

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Crown size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Avatares & Personalidade
              <Sparkles size={14} className="text-purple-400" />
            </h1>
            <p className="text-xs text-slate-500">
              Personalize a aparencia de cada IA para tornar tudo mais pessoal
            </p>
          </div>
        </div>

        {/* Sophia (Queen) */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Crown size={12} />
            Rainha
          </h2>
          <AgentAvatarEditor agent={sophia} role="queen" onSave={handleSave} />
        </div>

        {/* Princesses */}
        <div>
          <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles size={12} />
            Princesas
          </h2>
          <div className="space-y-4">
            {princesses.map((princess) => (
              <AgentAvatarEditor key={princess.id} agent={princess} role="princess" onSave={handleSave} />
            ))}

            {/* Princesas que ainda nao existem */}
            {expectedPrincesses
              .filter(name => !existingNames.includes(name))
              .map((name) => {
                const colors = PRINCESS_COLORS[name] || { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
                return (
                  <div
                    key={name}
                    className={`rounded-xl border border-dashed ${colors.border} ${colors.bg} p-5 opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-2xl border-2 border-dashed ${colors.border} flex items-center justify-center`}>
                        <Sparkles size={24} className={colors.color} />
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold ${colors.color}`}>{name}</h3>
                        <p className="text-xs text-slate-600">
                          Princesa ainda nao criada. Sera configuravel quando Sophia a criar.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
