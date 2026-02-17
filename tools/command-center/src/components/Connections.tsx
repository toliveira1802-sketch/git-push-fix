import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { RouteConfig, CATEGORY_CONFIG, RouteCategory } from '../types/routes';
import { supabase } from '../hooks/useSupabase';

// =============================================
// Connections.tsx - Editable Flow Lines
// =============================================
// Permite criar/editar/deletar conexoes entre paginas
// Persistidas no Supabase (ia_knowledge_base)
// Sophia Observer integrado via callback

export interface UserConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  type?: 'flow' | 'redirect' | 'api' | 'data';
}

interface ConnectionsProps {
  routes: RouteConfig[];
  scale: number;
  offset: { x: number; y: number };
  editable?: boolean;
  userConnections?: UserConnection[];
  onConnectionCreate?: (fromId: string, toId: string) => void;
  onConnectionDelete?: (connectionId: string) => void;
  connectingFrom?: string | null;
}

interface ConnectionLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  category: RouteCategory;
  isUser?: boolean;
  label?: string;
  type?: string;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

const TYPE_COLORS: Record<string, string> = {
  flow: '#a855f7',
  redirect: '#3b82f6',
  api: '#06b6d4',
  data: '#22c55e',
};

export default function Connections({
  routes,
  scale,
  offset,
  editable = false,
  userConnections = [],
  onConnectionCreate,
  onConnectionDelete,
  connectingFrom,
}: ConnectionsProps) {
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);

  // Build route position map
  const routeMap = useMemo(() => {
    const map: Record<string, { x: number; y: number }> = {};
    routes.forEach(r => {
      if (r.x != null && r.y != null) {
        map[r.id] = { x: r.x + NODE_WIDTH / 2, y: r.y + NODE_HEIGHT / 2 };
      }
    });
    return map;
  }, [routes]);

  // Auto-generated connections (by category)
  const autoConnections = useMemo(() => {
    const lines: ConnectionLine[] = [];
    const grouped: Record<string, RouteConfig[]> = {};

    routes.forEach((route) => {
      if (!route.x || !route.y) return;
      if (!grouped[route.category]) grouped[route.category] = [];
      grouped[route.category].push(route);
    });

    Object.entries(grouped).forEach(([category, categoryRoutes]) => {
      const config = CATEGORY_CONFIG[category as RouteCategory];
      if (!config) return;

      const byRow: Record<number, RouteConfig[]> = {};
      categoryRoutes.forEach((route) => {
        const y = route.y!;
        if (!byRow[y]) byRow[y] = [];
        byRow[y].push(route);
      });

      Object.values(byRow).forEach((rowRoutes) => {
        const sorted = [...rowRoutes].sort((a, b) => (a.x || 0) - (b.x || 0));
        for (let i = 0; i < sorted.length - 1; i++) {
          const from = sorted[i];
          const to = sorted[i + 1];
          if (!from.x || !from.y || !to.x || !to.y) continue;
          lines.push({
            id: `auto-${from.id}-${to.id}`,
            x1: from.x + NODE_WIDTH / 2,
            y1: from.y + NODE_HEIGHT / 2,
            x2: to.x + NODE_WIDTH / 2,
            y2: to.y + NODE_HEIGHT / 2,
            color: config.color,
            category: category as RouteCategory,
          });
        }
      });

      const rowKeys = Object.keys(byRow).map(Number).sort((a, b) => a - b);
      for (let i = 0; i < rowKeys.length - 1; i++) {
        const currentRow = byRow[rowKeys[i]];
        const nextRow = byRow[rowKeys[i + 1]];
        if (!currentRow.length || !nextRow.length) continue;
        const lastInRow = currentRow.sort((a, b) => (a.x || 0) - (b.x || 0))[currentRow.length - 1];
        const firstInNext = nextRow.sort((a, b) => (a.x || 0) - (b.x || 0))[0];
        if (!lastInRow.x || !lastInRow.y || !firstInNext.x || !firstInNext.y) continue;
        lines.push({
          id: `auto-row-${lastInRow.id}-${firstInNext.id}`,
          x1: lastInRow.x + NODE_WIDTH / 2,
          y1: lastInRow.y + NODE_HEIGHT / 2,
          x2: firstInNext.x + NODE_WIDTH / 2,
          y2: firstInNext.y + NODE_HEIGHT / 2,
          color: config.color,
          category: category as RouteCategory,
        });
      }
    });

    return lines;
  }, [routes]);

  // User connections mapped to lines
  const userLines = useMemo(() => {
    const lines: ConnectionLine[] = [];
    userConnections.forEach(uc => {
      const from = routeMap[uc.fromId];
      const to = routeMap[uc.toId];
      if (!from || !to) return;
      lines.push({
        id: `user-${uc.id}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        color: uc.color || TYPE_COLORS[uc.type || 'flow'] || '#a855f7',
        category: 'dev' as RouteCategory,
        isUser: true,
        label: uc.label,
        type: uc.type,
      });
    });
    return lines;
  }, [userConnections, routeMap]);

  const allConnections = useMemo(() => [...autoConnections, ...userLines], [autoConnections, userLines]);

  const getPath = (conn: ConnectionLine) => {
    const dx = conn.x2 - conn.x1;
    const dy = conn.y2 - conn.y1;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    if (isHorizontal) {
      const cx = dx * 0.4;
      return `M ${conn.x1} ${conn.y1} C ${conn.x1 + cx} ${conn.y1}, ${conn.x2 - cx} ${conn.y2}, ${conn.x2} ${conn.y2}`;
    } else {
      const cy = dy * 0.4;
      return `M ${conn.x1} ${conn.y1} C ${conn.x1} ${conn.y1 + cy}, ${conn.x2} ${conn.y2 - cy}, ${conn.x2} ${conn.y2}`;
    }
  };

  // Arrow marker for user connections
  const getArrowPath = (conn: ConnectionLine) => {
    const dx = conn.x2 - conn.x1;
    const dy = conn.y2 - conn.y1;
    const angle = Math.atan2(dy, dx);
    const arrowSize = 8;
    const tipX = conn.x2;
    const tipY = conn.y2;
    const x1 = tipX - arrowSize * Math.cos(angle - Math.PI / 6);
    const y1 = tipY - arrowSize * Math.sin(angle - Math.PI / 6);
    const x2 = tipX - arrowSize * Math.cos(angle + Math.PI / 6);
    const y2 = tipY - arrowSize * Math.sin(angle + Math.PI / 6);
    return `M ${tipX} ${tipY} L ${x1} ${y1} M ${tipX} ${tipY} L ${x2} ${y2}`;
  };

  // Label midpoint
  const getMidpoint = (conn: ConnectionLine) => ({
    x: (conn.x1 + conn.x2) / 2,
    y: (conn.y1 + conn.y2) / 2,
  });

  if (allConnections.length === 0 && !connectingFrom) return null;

  return (
    <svg
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: editable ? 'auto' : 'none',
      }}
    >
      <defs>
        <filter id="conn-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="user-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g>
        {/* Auto connections (dimmed) */}
        {autoConnections.map((conn) => {
          const path = getPath(conn);
          return (
            <g key={conn.id}>
              <path d={path} fill="none" stroke={conn.color} strokeWidth={3} opacity={0.05} filter="url(#conn-glow)" />
              <path d={path} fill="none" stroke={conn.color} strokeWidth={1.5} opacity={0.12} strokeLinecap="round" />
              <circle cx={conn.x1} cy={conn.y1} r={2} fill={conn.color} opacity={0.15} />
              <circle cx={conn.x2} cy={conn.y2} r={2} fill={conn.color} opacity={0.15} />
            </g>
          );
        })}

        {/* User connections (bright, with arrows and labels) */}
        {userLines.map((conn) => {
          const path = getPath(conn);
          const arrowPath = getArrowPath(conn);
          const mid = getMidpoint(conn);
          const isHovered = hoveredConn === conn.id;

          return (
            <g
              key={conn.id}
              onMouseEnter={() => setHoveredConn(conn.id)}
              onMouseLeave={() => setHoveredConn(null)}
              style={{ cursor: editable ? 'pointer' : 'default' }}
            >
              {/* Glow */}
              <path d={path} fill="none" stroke={conn.color} strokeWidth={6} opacity={0.1} filter="url(#user-glow)" />

              {/* Hit area (invisible, for hover/click) */}
              {editable && (
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ pointerEvents: 'stroke' }}
                  onClick={() => {
                    if (onConnectionDelete) {
                      const realId = conn.id.replace('user-', '');
                      onConnectionDelete(realId);
                    }
                  }}
                />
              )}

              {/* Main line */}
              <path
                d={path}
                fill="none"
                stroke={conn.color}
                strokeWidth={isHovered ? 3 : 2}
                opacity={isHovered ? 0.9 : 0.6}
                strokeLinecap="round"
                strokeDasharray={conn.type === 'api' ? '6 4' : conn.type === 'data' ? '3 3' : 'none'}
              />

              {/* Arrow */}
              <path
                d={arrowPath}
                fill="none"
                stroke={conn.color}
                strokeWidth={2}
                opacity={isHovered ? 0.9 : 0.6}
                strokeLinecap="round"
              />

              {/* Endpoints */}
              <circle cx={conn.x1} cy={conn.y1} r={4} fill={conn.color} opacity={isHovered ? 0.8 : 0.4} />
              <circle cx={conn.x2} cy={conn.y2} r={4} fill={conn.color} opacity={isHovered ? 0.8 : 0.4} />

              {/* Label */}
              {conn.label && (
                <g>
                  <rect
                    x={mid.x - conn.label.length * 3.5 - 6}
                    y={mid.y - 10}
                    width={conn.label.length * 7 + 12}
                    height={20}
                    rx={6}
                    fill="#0f172a"
                    stroke={conn.color}
                    strokeWidth={1}
                    opacity={isHovered ? 0.95 : 0.7}
                  />
                  <text
                    x={mid.x}
                    y={mid.y + 4}
                    textAnchor="middle"
                    fill={conn.color}
                    fontSize={10}
                    fontWeight="500"
                    opacity={isHovered ? 1 : 0.8}
                  >
                    {conn.label}
                  </text>
                </g>
              )}

              {/* Type badge */}
              {conn.type && !conn.label && (
                <g>
                  <rect
                    x={mid.x - 14}
                    y={mid.y - 8}
                    width={28}
                    height={16}
                    rx={4}
                    fill="#0f172a"
                    stroke={conn.color}
                    strokeWidth={0.5}
                    opacity={isHovered ? 0.9 : 0.5}
                  />
                  <text
                    x={mid.x}
                    y={mid.y + 3}
                    textAnchor="middle"
                    fill={conn.color}
                    fontSize={8}
                    fontWeight="600"
                    opacity={isHovered ? 1 : 0.7}
                  >
                    {conn.type.toUpperCase()}
                  </text>
                </g>
              )}

              {/* Delete button on hover */}
              {editable && isHovered && (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onConnectionDelete) {
                      const realId = conn.id.replace('user-', '');
                      onConnectionDelete(realId);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={mid.x + (conn.label ? conn.label.length * 3.5 + 14 : 22)} cy={mid.y} r={8} fill="#ef4444" opacity={0.8} />
                  <text
                    x={mid.x + (conn.label ? conn.label.length * 3.5 + 14 : 22)}
                    y={mid.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    x
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Connecting line preview (when user is creating a connection) */}
        {connectingFrom && routeMap[connectingFrom] && (
          <circle
            cx={routeMap[connectingFrom].x}
            cy={routeMap[connectingFrom].y}
            r={6}
            fill="none"
            stroke="#a855f7"
            strokeWidth={2}
            opacity={0.8}
          >
            <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    </svg>
  );
}
