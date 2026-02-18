import React, { useMemo, useCallback, useRef } from 'react';
import { RouteConfig, CATEGORY_CONFIG } from '../types/routes';

interface MiniMapProps {
  routes: RouteConfig[];
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visible: boolean;
  onNavigate: (x: number, y: number) => void;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const PADDING = 10;

export default function MiniMap({ routes, viewport, visible, onNavigate }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the bounds of all routes
  const bounds = useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    routes.forEach((route) => {
      if (route.x === undefined || route.y === undefined) return;
      minX = Math.min(minX, route.x);
      minY = Math.min(minY, route.y);
      maxX = Math.max(maxX, route.x + 160); // approximate node width
      maxY = Math.max(maxY, route.y + 80);  // approximate node height
    });

    if (minX === Infinity) {
      return { minX: 0, minY: 0, maxX: 1200, maxY: 2400, width: 1200, height: 2400 };
    }

    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;

    return { minX: minX - PADDING, minY: minY - PADDING, maxX, maxY, width, height };
  }, [routes]);

  // Scale factor to fit all routes in the minimap
  const scaleX = MINIMAP_WIDTH / bounds.width;
  const scaleY = MINIMAP_HEIGHT / bounds.height;
  const minimapScale = Math.min(scaleX, scaleY);

  // Convert world coordinates to minimap coordinates
  const toMinimap = useCallback(
    (worldX: number, worldY: number) => ({
      x: (worldX - bounds.minX) * minimapScale,
      y: (worldY - bounds.minY) * minimapScale,
    }),
    [bounds, minimapScale]
  );

  // Handle click on minimap to navigate
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert minimap coordinates back to world coordinates
      const worldX = clickX / minimapScale + bounds.minX;
      const worldY = clickY / minimapScale + bounds.minY;

      // Navigate so clicked point is at center of viewport
      onNavigate(worldX, worldY);
    },
    [minimapScale, bounds, onNavigate]
  );

  // Viewport rectangle in minimap coordinates
  const viewportRect = useMemo(() => {
    const topLeft = toMinimap(-viewport.x, -viewport.y);
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: viewport.width * minimapScale,
      height: viewport.height * minimapScale,
    };
  }, [viewport, toMinimap, minimapScale]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 select-none"
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      {/* Background */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full h-full rounded-lg border border-slate-600/50 cursor-crosshair overflow-hidden"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
      >
        {/* Label */}
        <div className="absolute top-1 left-2 text-[9px] font-medium text-slate-500 uppercase tracking-wider pointer-events-none">
          Mapa
        </div>

        {/* Route dots */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
        >
          {routes.map((route) => {
            if (route.x === undefined || route.y === undefined) return null;
            const pos = toMinimap(route.x + 80, route.y + 40); // center of node
            const config = CATEGORY_CONFIG[route.category];
            const dotSize = route.status === 'active' ? 2.5 : 1.5;

            return (
              <circle
                key={route.id}
                cx={pos.x}
                cy={pos.y}
                r={dotSize}
                fill={config.color}
                opacity={route.status === 'active' ? 0.9 : 0.5}
              />
            );
          })}

          {/* Viewport rectangle */}
          <rect
            x={Math.max(0, viewportRect.x)}
            y={Math.max(0, viewportRect.y)}
            width={Math.min(viewportRect.width, MINIMAP_WIDTH)}
            height={Math.min(viewportRect.height, MINIMAP_HEIGHT)}
            fill="rgba(59, 130, 246, 0.08)"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth={1}
            rx={2}
          />
        </svg>

        {/* Category legend at bottom */}
        <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 pointer-events-none">
          {(Object.entries(CATEGORY_CONFIG) as [string, { label: string; color: string }][])
            .slice(0, 5)
            .map(([key, config]) => (
              <div key={key} className="flex items-center gap-0.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-[7px] text-slate-500">{config.label.slice(0, 3)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
