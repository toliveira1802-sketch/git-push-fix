import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Map,
  BarChart3,
  Presentation,
  Terminal,
} from 'lucide-react';

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleMinimap: () => void;
  onToggleStats: () => void;
  onTogglePresentation: () => void;
}

export default function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleMinimap,
  onToggleStats,
  onTogglePresentation,
}: ToolbarProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: App title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-blue-400" />
          <h1 className="text-sm font-bold text-slate-100 tracking-wide">
            Command Center
          </h1>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            -
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Doctor Auto
          </span>
        </div>
      </div>

      {/* Center: Zoom controls */}
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5">
        <ToolbarButton
          onClick={onZoomOut}
          icon={<ZoomOut size={15} />}
          tooltip="Diminuir zoom"
          disabled={zoom <= 0.25}
        />
        <button
          onClick={onResetZoom}
          className="px-2 py-1 text-xs font-mono text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded transition-colors min-w-[52px] text-center"
          title="Resetar zoom"
        >
          {zoomPercent}%
        </button>
        <ToolbarButton
          onClick={onZoomIn}
          icon={<ZoomIn size={15} />}
          tooltip="Aumentar zoom"
          disabled={zoom >= 3}
        />
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <ToolbarButton
          onClick={onResetZoom}
          icon={<Maximize2 size={15} />}
          tooltip="Resetar visualizacao"
        />
      </div>

      {/* Right: Toggle buttons */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={onToggleMinimap}
          icon={<Map size={15} />}
          tooltip="Minimapa"
        />
        <ToolbarButton
          onClick={onToggleStats}
          icon={<BarChart3 size={15} />}
          tooltip="Estatisticas"
        />
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <ToolbarButton
          onClick={onTogglePresentation}
          icon={<Presentation size={15} />}
          tooltip="Modo apresentacao"
        />
      </div>
    </div>
  );
}

/* ----- Helper sub-component ----- */

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
  active?: boolean;
}

function ToolbarButton({
  onClick,
  icon,
  tooltip,
  disabled = false,
  active = false,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`p-1.5 rounded transition-colors ${
        disabled
          ? 'text-slate-600 cursor-not-allowed'
          : active
          ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
      }`}
    >
      {icon}
    </button>
  );
}
