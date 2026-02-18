import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Minimize2,
  Maximize2,
  Loader2,
  GripVertical,
  AlertTriangle,
} from 'lucide-react';

// URL do site Doctor Auto (env var ou fallback pro localhost do Lovable)
const BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8080';

type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: Record<Viewport, { width: number; label: string; icon: typeof Monitor }> = {
  desktop: { width: 1280, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, label: 'Mobile', icon: Smartphone },
};

interface PagePreviewProps {
  path: string;
  onClose: () => void;
}

export default function PagePreview({ path, onClose }: PagePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(640);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Clean path for URL construction
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${BASE_URL}${cleanPath}`;

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = fullUrl;
    }
    // Timeout: se nao carregou em 15s, mostra erro
    setTimeout(() => {
      setIsLoading(prev => {
        if (prev) setLoadError(true);
        return false;
      });
    }, 15000);
  }, [fullUrl]);

  const handleOpenNewTab = useCallback(() => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  }, [fullUrl]);

  // Resize drag logic
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.max(380, Math.min(window.innerWidth * 0.8, startWidth.current + delta));
      setPanelWidth(newWidth);
    };

    const handleResizeEnd = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const currentViewport = VIEWPORTS[viewport];

  return (
    <div
      className={`flex flex-col bg-slate-900 border-l border-slate-700 h-full ${
        isMaximized ? 'fixed inset-0 z-50 border-l-0' : 'relative'
      }`}
      style={isMaximized ? undefined : { width: panelWidth }}
    >
      {/* Resize handle */}
      {!isMaximized && (
        <div
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 group hover:bg-blue-500/30 transition-colors flex items-center"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={12} className="text-slate-500" />
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/80 shrink-0">
        {/* Left: title + URL */}
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
          <span className="text-xs font-medium text-slate-300 truncate">
            Preview
          </span>
          <code className="text-[11px] bg-slate-950 px-2 py-0.5 rounded text-blue-300 font-mono truncate max-w-[240px]">
            {cleanPath}
          </code>
        </div>

        {/* Right: close */}
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
          title="Fechar preview (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/60 bg-slate-850 shrink-0">
        {/* Viewport toggles */}
        <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
          {(Object.entries(VIEWPORTS) as [Viewport, typeof VIEWPORTS.desktop][]).map(
            ([key, vp]) => {
              const Icon = vp.icon;
              const isActive = viewport === key;
              return (
                <button
                  key={key}
                  onClick={() => setViewport(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title={`${vp.label} (${vp.width}px)`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{vp.label}</span>
                  <span className="text-[10px] opacity-70">{vp.width}</span>
                </button>
              );
            }
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Recarregar"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsMaximized(v => !v)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={isMaximized ? 'Minimizar' : 'Maximizar'}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Abrir em nova aba"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Iframe area */}
      <div className="flex-1 bg-slate-950 flex items-start justify-center overflow-auto p-2 relative">
        {/* Loading overlay with timeout */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-blue-400 animate-spin" />
              <span className="text-xs text-slate-400">Carregando {cleanPath}...</span>
              <span className="text-[10px] text-slate-600">{fullUrl}</span>
            </div>
          </div>
        )}

        {/* Load error */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 z-10">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <AlertTriangle size={28} className="text-amber-400" />
              <span className="text-sm text-slate-300">Nao foi possivel carregar o preview</span>
              <code className="text-[10px] text-slate-500 bg-slate-800 px-3 py-1 rounded">{fullUrl}</code>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRefresh}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={handleOpenNewTab}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                >
                  Abrir em nova aba
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device frame */}
        <div
          className="bg-white rounded-lg shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300 ease-out h-full"
          style={{
            width: isMaximized
              ? viewport === 'desktop'
                ? '100%'
                : currentViewport.width
              : Math.min(currentViewport.width, panelWidth - 16),
            maxWidth: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            src={fullUrl}
            title={`Preview: ${cleanPath}`}
            className="w-full h-full border-0"
            onLoad={() => { setIsLoading(false); setLoadError(false); }}
            onError={() => { setIsLoading(false); setLoadError(true); }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-slate-700/60 bg-slate-800/50 text-[10px] text-slate-500 shrink-0">
        <span>{currentViewport.label} - {currentViewport.width}px</span>
        <span className="truncate max-w-[300px] ml-2">{fullUrl}</span>
      </div>
    </div>
  );
}
