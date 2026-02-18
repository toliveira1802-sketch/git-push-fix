import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Pencil,
  BarChart3,
  StickyNote,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Shield,
  FileCode,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { RouteConfig, RouteCategory, RouteStatus, CATEGORY_CONFIG, STATUS_CONFIG } from '../types/routes';

interface PageEditorProps {
  route: RouteConfig;
  onClose: () => void;
  onSave: (routeId: string, route: RouteConfig, data: PageEditData) => void;
  initialConfig?: import('../hooks/usePageConfigs').PageConfig;
}

export interface PageEditData {
  // Route metadata
  description: string;
  status: RouteStatus;
  category: RouteCategory;
  roles: string[];
  // KPIs & Annotations
  kpis: KPI[];
  notes: string;
  priority: 'alta' | 'media' | 'baixa' | 'nenhuma';
  tags: string[];
}

interface KPI {
  id: string;
  label: string;
  value: string;
  type: 'numero' | 'percentual' | 'moeda' | 'texto';
  meta?: string;
}

const AVAILABLE_ROLES = ['admin', 'gestao', 'dev', 'user'];
const PRIORITY_CONFIG = {
  alta: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' },
  media: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
  baixa: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' },
  nenhuma: { color: 'text-slate-400', bg: 'bg-slate-700 border-slate-600' },
};

export default function PageEditor({ route, onClose, onSave, initialConfig }: PageEditorProps) {
  const [activeSection, setActiveSection] = useState<'info' | 'kpis' | 'notas'>('info');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state — inicializa do banco (initialConfig) ou do hardcoded (route)
  const [description, setDescription] = useState(initialConfig?.description || route.description || '');
  const [status, setStatus] = useState<RouteStatus>(initialConfig?.status || route.status);
  const [category, setCategory] = useState<RouteCategory>(initialConfig?.category || route.category);
  const [roles, setRoles] = useState<string[]>(initialConfig?.roles?.length ? initialConfig.roles : route.roles);
  const [notes, setNotes] = useState(initialConfig?.notes || '');
  const [priority, setPriority] = useState<PageEditData['priority']>(initialConfig?.priority || 'nenhuma');
  const [tags, setTags] = useState<string[]>(initialConfig?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [kpis, setKpis] = useState<KPI[]>(initialConfig?.kpis || []);

  async function handleSave() {
    setSaving(true);

    const data: PageEditData = {
      description,
      status,
      category,
      roles,
      kpis,
      notes,
      priority,
      tags,
    };

    // Salva direto via onSave → App.tsx → usePageConfigs.saveConfig()
    // Tabela: cc_page_configs (dedicada, com colunas tipadas)
    onSave(route.id, route, data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addKPI() {
    setKpis(prev => [
      ...prev,
      { id: `kpi-${Date.now()}`, label: '', value: '', type: 'numero' },
    ]);
  }

  function updateKPI(id: string, field: keyof KPI, value: string) {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k));
  }

  function removeKPI(id: string) {
    setKpis(prev => prev.filter(k => k.id !== id));
  }

  function toggleRole(role: string) {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  }

  function addTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag));
  }

  const sections = [
    { key: 'info' as const, label: 'Info & Config', icon: Pencil },
    { key: 'kpis' as const, label: 'KPIs & Metricas', icon: BarChart3 },
    { key: 'notas' as const, label: 'Notas & Tags', icon: StickyNote },
  ];

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-emerald-500/10 to-slate-800/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Pencil size={14} className="text-emerald-400 flex-shrink-0" />
          <h2 className="text-sm font-semibold text-slate-200 truncate">
            Editar: {route.component}
          </h2>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-slate-700/50">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium transition-colors ${
              activeSection === s.key
                ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <s.icon size={12} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSection === 'info' && (
          <>
            {/* Path (read-only) */}
            <Field label="Path">
              <code className="text-xs bg-slate-800 px-2 py-1.5 rounded text-blue-300 font-mono block">
                {route.path}
              </code>
            </Field>

            {/* Arquivo (read-only) */}
            <Field label="Arquivo">
              <code className="text-xs bg-slate-800 px-2 py-1.5 rounded text-amber-300 font-mono block">
                {route.fileName}
              </code>
            </Field>

            {/* Description */}
            <Field label="Descricao">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                placeholder="Descreva o que essa pagina faz..."
              />
            </Field>

            {/* Status */}
            <Field label="Status">
              <div className="flex gap-1.5">
                {(Object.keys(STATUS_CONFIG) as RouteStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      status === s
                        ? `${STATUS_CONFIG[s].dot} bg-opacity-30 border-current text-white`
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                    style={status === s ? { borderColor: STATUS_CONFIG[s].color, backgroundColor: `${STATUS_CONFIG[s].color}22`, color: STATUS_CONFIG[s].color } : {}}
                  >
                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Category */}
            <Field label="Categoria">
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as RouteCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  {(Object.keys(CATEGORY_CONFIG) as RouteCategory[]).map(c => (
                    <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </Field>

            {/* Roles */}
            <Field label="Roles de Acesso">
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      roles.includes(role)
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Shield size={10} className="inline mr-1" />
                    {role}
                  </button>
                ))}
              </div>
            </Field>

            {/* Priority */}
            <Field label="Prioridade">
              <div className="flex gap-1.5">
                {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      priority === p
                        ? PRIORITY_CONFIG[p].bg + ' ' + PRIORITY_CONFIG[p].color
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p === 'alta' && <AlertTriangle size={10} className="inline mr-1" />}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        {activeSection === 'kpis' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                KPIs e metricas desta pagina
              </p>
              <button
                onClick={addKPI}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-md text-xs transition-colors"
              >
                <Plus size={10} />
                Novo KPI
              </button>
            </div>

            {kpis.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 size={32} className="mx-auto text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">Nenhum KPI definido</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Clique "Novo KPI" pra adicionar metricas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.map(kpi => (
                  <div
                    key={kpi.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        value={kpi.label}
                        onChange={e => updateKPI(kpi.id, 'label', e.target.value)}
                        placeholder="Nome do KPI (ex: Ticket Medio)"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => removeKPI(kpi.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={kpi.type}
                        onChange={e => updateKPI(kpi.id, 'type', e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="numero">Numero</option>
                        <option value="percentual">%</option>
                        <option value="moeda">R$</option>
                        <option value="texto">Texto</option>
                      </select>
                      <input
                        value={kpi.value}
                        onChange={e => updateKPI(kpi.id, 'value', e.target.value)}
                        placeholder="Valor atual"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        value={kpi.meta || ''}
                        onChange={e => updateKPI(kpi.id, 'meta', e.target.value)}
                        placeholder="Meta"
                        className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeSection === 'notas' && (
          <>
            {/* Notes */}
            <Field label="Notas / Observacoes">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={8}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                placeholder="Anotacoes sobre a pagina, bugs conhecidos, melhorias planejadas, regras especificas..."
              />
            </Field>

            {/* Tags */}
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="Nova tag..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={addTag}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg text-xs transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </Field>
          </>
        )}
      </div>
    </div>
  );
}

/* ----- Helper ----- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
