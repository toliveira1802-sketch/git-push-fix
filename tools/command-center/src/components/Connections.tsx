import React, { useMemo } from 'react';
import { RouteConfig, CATEGORY_CONFIG, RouteCategory } from '../types/routes';

interface ConnectionsProps {
  routes: RouteConfig[];
  scale: number;
  offset: { x: number; y: number };
}

interface ConnectionLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  category: RouteCategory;
}

export default function Connections({ routes, scale, offset }: ConnectionsProps) {
  const connections = useMemo(() => {
    const lines: ConnectionLine[] = [];

    // Group routes by category
    const grouped: Record<string, RouteConfig[]> = {};
    routes.forEach((route) => {
      if (!route.x || !route.y) return;
      if (!grouped[route.category]) {
        grouped[route.category] = [];
      }
      grouped[route.category].push(route);
    });

    // For each category, connect routes that share the same y position (same row)
    Object.entries(grouped).forEach(([category, categoryRoutes]) => {
      const config = CATEGORY_CONFIG[category as RouteCategory];
      if (!config) return;

      // Group by y position (same row)
      const byRow: Record<number, RouteConfig[]> = {};
      categoryRoutes.forEach((route) => {
        const y = route.y!;
        if (!byRow[y]) {
          byRow[y] = [];
        }
        byRow[y].push(route);
      });

      // Connect consecutive routes in each row
      Object.values(byRow).forEach((rowRoutes) => {
        // Sort by x position
        const sorted = [...rowRoutes].sort((a, b) => (a.x || 0) - (b.x || 0));

        for (let i = 0; i < sorted.length - 1; i++) {
          const from = sorted[i];
          const to = sorted[i + 1];
          if (!from.x || !from.y || !to.x || !to.y) continue;

          // Node card center offset (approx 80px wide, 40px tall)
          const nodeWidth = 160;
          const nodeHeight = 80;

          lines.push({
            id: `${from.id}-${to.id}`,
            x1: from.x + nodeWidth / 2,
            y1: from.y + nodeHeight / 2,
            x2: to.x + nodeWidth / 2,
            y2: to.y + nodeHeight / 2,
            color: config.color,
            category: category as RouteCategory,
          });
        }
      });

      // Also connect first route of consecutive rows within the same category
      const rowKeys = Object.keys(byRow)
        .map(Number)
        .sort((a, b) => a - b);

      for (let i = 0; i < rowKeys.length - 1; i++) {
        const currentRow = byRow[rowKeys[i]];
        const nextRow = byRow[rowKeys[i + 1]];
        if (!currentRow.length || !nextRow.length) continue;

        // Connect last of current row to first of next row
        const lastInRow = currentRow.sort((a, b) => (a.x || 0) - (b.x || 0))[currentRow.length - 1];
        const firstInNext = nextRow.sort((a, b) => (a.x || 0) - (b.x || 0))[0];

        if (!lastInRow.x || !lastInRow.y || !firstInNext.x || !firstInNext.y) continue;

        const nodeWidth = 160;
        const nodeHeight = 80;

        lines.push({
          id: `row-${lastInRow.id}-${firstInNext.id}`,
          x1: lastInRow.x + nodeWidth / 2,
          y1: lastInRow.y + nodeHeight / 2,
          x2: firstInNext.x + nodeWidth / 2,
          y2: firstInNext.y + nodeHeight / 2,
          color: config.color,
          category: category as RouteCategory,
        });
      }
    });

    return lines;
  }, [routes]);

  if (connections.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Glow filter for connection lines */}
        <filter id="conn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}
      >
        {connections.map((conn) => {
          // Calculate bezier control points for smooth curves
          const dx = conn.x2 - conn.x1;
          const dy = conn.y2 - conn.y1;
          const isHorizontal = Math.abs(dx) > Math.abs(dy);

          let path: string;

          if (isHorizontal) {
            // Horizontal connection with slight curve
            const cx = dx * 0.4;
            path = `M ${conn.x1} ${conn.y1} C ${conn.x1 + cx} ${conn.y1}, ${conn.x2 - cx} ${conn.y2}, ${conn.x2} ${conn.y2}`;
          } else {
            // Vertical connection with curve
            const cy = dy * 0.4;
            path = `M ${conn.x1} ${conn.y1} C ${conn.x1} ${conn.y1 + cy}, ${conn.x2} ${conn.y2 - cy}, ${conn.x2} ${conn.y2}`;
          }

          return (
            <g key={conn.id}>
              {/* Background glow */}
              <path
                d={path}
                fill="none"
                stroke={conn.color}
                strokeWidth={3}
                opacity={0.05}
                filter="url(#conn-glow)"
              />
              {/* Main line */}
              <path
                d={path}
                fill="none"
                stroke={conn.color}
                strokeWidth={1.5}
                opacity={0.15}
                strokeLinecap="round"
              />
              {/* Endpoint dots */}
              <circle
                cx={conn.x1}
                cy={conn.y1}
                r={2}
                fill={conn.color}
                opacity={0.2}
              />
              <circle
                cx={conn.x2}
                cy={conn.y2}
                r={2}
                fill={conn.color}
                opacity={0.2}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
