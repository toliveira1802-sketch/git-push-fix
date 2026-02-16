import React from 'react';
import {
  X,
  FileCode,
  FolderOpen,
  Shield,
  Eye,
  Pencil,
  Unplug,
  ExternalLink,
} from 'lucide-react';
import {
  RouteConfig,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from '../types/routes';

interface DetailPanelProps {
  route: RouteConfig | null;
  onClose: () => void;
  onOpenPreview?: (path: string) => void;
}

export default function DetailPanel({ route, onClose, onOpenPreview }: DetailPanelProps) {
  if (!route) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Eye size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm">Selecione uma rota</p>
            <p className="text-slate-600 text-xs mt-1">
              Clique em uma rota no mapa ou na sidebar para ver os detalhes
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[route.category];
  const statusConfig = STATUS_CONFIG[route.status];

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-200 truncate flex-1 mr-2">
          {route.component}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
          aria-label="Fechar painel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Path */}
        <DetailField
          label="Path"
          icon={<ExternalLink size={14} className="text-slate-500" />}
        >
          <code className="text-xs bg-slate-800 px-2 py-1 rounded text-blue-300 font-mono block truncate">
            {route.path}
          </code>
        </DetailField>

        {/* Component */}
        <DetailField
          label="Componente"
          icon={<FileCode size={14} className="text-slate-500" />}
        >
          <span className="text-sm text-slate-200">{route.component}</span>
        </DetailField>

        {/* File Name */}
        <DetailField
          label="Arquivo"
          icon={<FolderOpen size={14} className="text-slate-500" />}
        >
          <code className="text-xs bg-slate-800 px-2 py-1 rounded text-amber-300 font-mono block truncate">
            {route.fileName}
          </code>
        </DetailField>

        {/* Category */}
        <DetailField label="Categoria">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded"
            style={{
              backgroundColor: `${categoryConfig.color}22`,
              color: categoryConfig.color,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryConfig.color }}
            />
            {categoryConfig.label}
          </span>
        </DetailField>

        {/* Status */}
        <DetailField label="Status">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
            />
            <span style={{ color: statusConfig.color }}>
              {statusConfig.label}
            </span>
          </span>
        </DetailField>

        {/* Auth */}
        <DetailField
          label="Autenticacao"
          icon={<Shield size={14} className="text-slate-500" />}
        >
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              route.requiresAuth
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {route.requiresAuth ? 'Requer Auth' : 'Publica'}
          </span>
        </DetailField>

        {/* Roles */}
        <DetailField label="Roles">
          {route.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {route.roles.map((role) => (
                <span
                  key={role}
                  className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  {role}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">
              Nenhuma role definida
            </span>
          )}
        </DetailField>

        {/* Description */}
        <DetailField label="Descricao">
          <p className="text-xs text-slate-400 leading-relaxed">
            {route.description || 'Sem descricao disponivel.'}
          </p>
        </DetailField>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        {/* Reconnect - only for orphans */}
        {route.status === 'orphan' && (
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-sm font-medium transition-colors">
            <Unplug size={14} />
            Reconectar
          </button>
        )}

        {/* Preview */}
        <button
          onClick={() => onOpenPreview?.(route.path)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Eye size={14} />
          Abrir Preview
        </button>

        {/* Edit placeholder - Phase 2 */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
          title="Disponivel na Fase 2"
        >
          <Pencil size={14} />
          Editar Rota
          <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded ml-1">
            Fase 2
          </span>
        </button>
      </div>
    </div>
  );
}

/* ----- Helper sub-component ----- */

function DetailField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
