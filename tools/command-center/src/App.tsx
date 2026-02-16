import { useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import RouteNode from './components/RouteNode';
import DetailPanel from './components/DetailPanel';
import Toolbar from './components/Toolbar';
import Connections from './components/Connections';
import MiniMap from './components/MiniMap';
import StatsDialog from './components/StatsDialog';
import PresentationMode from './components/PresentationMode';
import PagePreview from './components/PagePreview';
import IAPanel from './components/IAPanel';
import { useRouteMap } from './hooks/useRouteMap';
import { usePanZoom } from './hooks/usePanZoom';

export default function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    filteredRoutes,
    selectedRoute,
    selectRoute,
    clearSelection,
  } = useRouteMap();

  const panZoom = usePanZoom(canvasRef);

  const [showMinimap, setShowMinimap] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [activeTab, setActiveTab] = useState<'rotas' | 'ias'>('rotas');
  const [previewPath, setPreviewPath] = useState<string | null>(null);

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
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          selectedRouteId={selectedRoute?.id ?? null}
          onSelectRoute={selectRoute}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'ias' ? (
          /* IA Panel - full area */
          <IAPanel />
        ) : (
          <>
            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950"
              onMouseDown={panZoom.handleMouseDown}
              onMouseMove={panZoom.handleMouseMove}
              onMouseUp={panZoom.handleMouseUp}
              onMouseLeave={panZoom.handleMouseUp}
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
                />

                {filteredRoutes.map(route => (
                  <RouteNode
                    key={route.id}
                    route={route}
                    isSelected={selectedRoute?.id === route.id}
                    onClick={() => selectRoute(route)}
                    scale={panZoom.scale}
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

            {/* Detail Panel */}
            {selectedRoute && (
              <DetailPanel
                route={selectedRoute}
                onClose={clearSelection}
                onOpenPreview={(path) => setPreviewPath(path)}
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
