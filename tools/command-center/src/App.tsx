import { useRef, useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RouteNode from './components/RouteNode';
import DetailPanel from './components/DetailPanel';
import Toolbar from './components/Toolbar';
import Connections from './components/Connections';
import MiniMap from './components/MiniMap';
import StatsDialog from './components/StatsDialog';
import PresentationMode from './components/PresentationMode';
import PagePreview from './components/PagePreview';
import PageEditor from './components/PageEditor';
import IAPanel from './components/IAPanel';
import SophiaChat from './components/SophiaChat';
import SophiaDashboard from './components/SophiaDashboard';
import SophiaAvatars from './components/SophiaAvatars';
import { useRouteMap } from './hooks/useRouteMap';
import { usePanZoom } from './hooks/usePanZoom';
import { useSophia } from './hooks/useAthena';
import { useSophiaObserver } from './hooks/useSophiaObserver';
import { useConnections } from './hooks/useConnections';
import { usePageConfigs } from './hooks/usePageConfigs';
import type { RouteConfig } from './types/routes';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Page configs do banco (override dos dados hardcoded)
  const pageConfigs = usePageConfigs();

  const {
    filteredRoutes,
    selectedRoute,
    selectRoute,
    clearSelection,
  } = useRouteMap(pageConfigs.configs);

  const panZoom = usePanZoom(canvasRef);
  const { sophia, princesses } = useSophia();

  const [showMinimap, setShowMinimap] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeTab, setActiveTab] = useState<'rotas' | 'ias' | 'sophia-chat' | 'sophia-dashboard' | 'sophia-avatars'>('rotas');
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [editingRoute, setEditingRoute] = useState<boolean>(false);

  // Sophia Observer - auto-learn from user interactions
  const observer = useSophiaObserver(sophia);

  // Editable connections between pages
  const conn = useConnections();

  // Track page views for Sophia
  const handleSelectRoute = useCallback((route: RouteConfig) => {
    selectRoute(route);
    observer.trackPageView(route.id, route.path, route.component);
  }, [selectRoute, observer]);

  // Track page editor saves — salva na cc_page_configs + Sophia observer
  const handlePageSave = useCallback((routeId: string, route: RouteConfig, data: any) => {
    console.log('Page saved:', routeId, data);
    pageConfigs.saveConfig(routeId, route, data);
    observer.trackEditorSave(routeId, data);
  }, [observer, pageConfigs]);

  // Handle connection node click (start or finish connection)
  const handleConnectClick = useCallback((routeId: string) => {
    if (conn.connectingFrom) {
      // Finish connection
      conn.finishConnecting(routeId).then(result => {
        if (result) {
          observer.trackConnectionCreate(result.fromId, result.toId);
        }
      });
    } else {
      // Start connection
      conn.startConnecting(routeId);
    }
  }, [conn, observer]);

  // Handle connection delete
  const handleConnectionDelete = useCallback((connectionId: string) => {
    const existing = conn.connections.find(c => c.id === connectionId);
    if (existing) {
      observer.trackConnectionDelete(existing.fromId, existing.toId);
    }
    conn.deleteConnection(connectionId);
  }, [conn, observer]);

  // ESC key to cancel connecting
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && conn.connectingFrom) {
      conn.cancelConnecting();
    }
  }, [conn]);

  // Attach ESC listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        zoom={panZoom.scale}
        onZoomIn={panZoom.zoomIn}
        onZoomOut={panZoom.zoomOut}
        onResetZoom={panZoom.resetZoom}
        onToggleMinimap={() => setShowMinimap(v => !v)}
        onToggleStats={() => setShowStats(v => !v)}
        onTogglePresentation={() => setShowPresentation(true)}
        connectionsEditable={conn.editable}
        onToggleConnections={conn.toggleEditable}
        connectingFrom={conn.connectingFrom}
        onCancelConnect={conn.cancelConnecting}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          selectedRouteId={selectedRoute?.id ?? null}
          onSelectRoute={handleSelectRoute}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'ias' ? (
          <IAPanel />
        ) : activeTab === 'sophia-chat' ? (
          <SophiaChat sophia={sophia} />
        ) : activeTab === 'sophia-dashboard' ? (
          <SophiaDashboard sophia={sophia} />
        ) : activeTab === 'sophia-avatars' ? (
          <SophiaAvatars sophia={sophia} princesses={princesses} />
        ) : (
          <>
            {/* Canvas */}
            <div
              ref={canvasRef}
              className={`flex-1 relative overflow-hidden bg-slate-950 ${
                conn.editable
                  ? conn.connectingFrom
                    ? 'cursor-crosshair'
                    : 'cursor-default'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
              onMouseDown={conn.editable ? undefined : panZoom.handleMouseDown}
              onMouseMove={conn.editable ? undefined : panZoom.handleMouseMove}
              onMouseUp={conn.editable ? undefined : panZoom.handleMouseUp}
              onMouseLeave={conn.editable ? undefined : panZoom.handleMouseUp}
              onClick={() => {
                if (conn.connectingFrom) {
                  // Click on empty space cancels
                  conn.cancelConnecting();
                }
              }}
            >
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
                  backgroundSize: `${30 * panZoom.scale}px ${30 * panZoom.scale}px`,
                  backgroundPosition: `${panZoom.x}px ${panZoom.y}px`,
                }}
              />

              {/* Edit mode indicator */}
              {conn.editable && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-purple-500/15 border border-purple-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-xs text-purple-300 font-medium">
                    Modo Fluxo: Clique em um node pra iniciar conexao
                  </span>
                </div>
              )}

              {/* Route nodes container */}
              <div
                className="absolute"
                style={{
                  transform: `translate(${panZoom.x}px, ${panZoom.y}px) scale(${panZoom.scale})`,
                  transformOrigin: '0 0',
                }}
              >
                <Connections
                  routes={filteredRoutes}
                  scale={panZoom.scale}
                  offset={{ x: panZoom.x, y: panZoom.y }}
                  editable={conn.editable}
                  userConnections={conn.connections}
                  onConnectionCreate={(fromId, toId) => conn.createConnection(fromId, toId)}
                  onConnectionDelete={handleConnectionDelete}
                  connectingFrom={conn.connectingFrom}
                />

                {filteredRoutes.map(route => (
                  <RouteNode
                    key={route.id}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onClick={() => handleSelectRoute(route)}
                    scale={panZoom.scale}
                    connectMode={conn.editable}
                    isConnectSource={conn.connectingFrom === route.id}
                    onConnectClick={handleConnectClick}
                  />
                ))}
              </div>

              {/* Minimap */}
              <MiniMap
                routes={filteredRoutes}
                viewport={{
                  x: -panZoom.x / panZoom.scale,
                  y: -panZoom.y / panZoom.scale,
                  width: (canvasRef.current?.clientWidth ?? 800) / panZoom.scale,
                  height: (canvasRef.current?.clientHeight ?? 600) / panZoom.scale,
                }}
                visible={showMinimap}
                onNavigate={(x, y) => {
                  panZoom.setPosition(-x * panZoom.scale, -y * panZoom.scale);
                }}
              />
            </div>

            {/* Detail Panel or Page Editor */}
            {selectedRoute && !editingRoute && !conn.editable && (
              <DetailPanel
                route={selectedRoute}
                onClose={clearSelection}
                onOpenPreview={(path) => setPreviewPath(path)}
                onOpenEditor={() => setEditingRoute(true)}
              />
            )}

            {selectedRoute && editingRoute && (
              <PageEditor
                route={selectedRoute}
                onClose={() => setEditingRoute(false)}
                onSave={handlePageSave}
                initialConfig={pageConfigs.getConfig(selectedRoute.id)}
              />
            )}

            {/* Page Preview */}
            {previewPath && (
              <PagePreview
                path={previewPath}
                onClose={() => setPreviewPath(null)}
              />
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <StatsDialog open={showStats} onClose={() => setShowStats(false)} />
      <PresentationMode active={showPresentation} onExit={() => setShowPresentation(false)} />
    </div>
  );
}
