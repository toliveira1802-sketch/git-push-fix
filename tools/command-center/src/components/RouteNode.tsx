import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Lock, Unlock, Link, GripVertical } from 'lucide-react';
import {
  RouteConfig,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from '../types/routes';

interface RouteNodeProps {
  route: RouteConfig;
  isSelected: boolean;
  onClick: () => void;
  scale: number;
  connectMode?: boolean;
  isConnectSource?: boolean;
  onConnectClick?: (routeId: string) => void;
  onDragEnd?: (routeId: string, x: number, y: number) => void;
  draggable?: boolean;
}

const DRAG_THRESHOLD = 5; // px — below this is a click, above is drag

export default function RouteNode({
  route,
  isSelected,
  onClick,
  scale,
  connectMode = false,
  isConnectSource = false,
  onConnectClick,
  onDragEnd,
  draggable = true,
}: RouteNodeProps) {
  const categoryConfig = CATEGORY_CONFIG[route.category];
  const statusConfig = STATUS_CONFIG[route.status];

  // Drag state
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
    isDragging: boolean;
  } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (connectMode || !draggable || e.button !== 0) return;
    e.stopPropagation(); // Prevent canvas pan

    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX: route.x ?? 0,
      startNodeY: route.y ?? 0,
      isDragging: false,
    };

    const handleMouseMove = (me: MouseEvent) => {
      if (!dragRef.current) return;

      const dx = me.clientX - dragRef.current.startMouseX;
      const dy = me.clientY - dragRef.current.startMouseY;
      const dist = Math.hypot(dx, dy);

      if (dist >= DRAG_THRESHOLD) {
        dragRef.current.isDragging = true;
        const newX = dragRef.current.startNodeX + dx / scale;
        const newY = dragRef.current.startNodeY + dy / scale;
        setLocalPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = (me: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (!dragRef.current) return;

      const dx = me.clientX - dragRef.current.startMouseX;
      const dy = me.clientY - dragRef.current.startMouseY;
      const dist = Math.hypot(dx, dy);

      if (dist < DRAG_THRESHOLD) {
        // Treat as click
        if (connectMode && onConnectClick) {
          onConnectClick(route.id);
        } else {
          onClick();
        }
      } else {
        // Commit drag
        const finalX = dragRef.current.startNodeX + dx / scale;
        const finalY = dragRef.current.startNodeY + dy / scale;
        onDragEnd?.(route.id, Math.round(finalX), Math.round(finalY));
      }

      dragRef.current = null;
      setLocalPos(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [connectMode, draggable, route.id, route.x, route.y, scale, onClick, onConnectClick, onDragEnd]);

  // Handle click in connect mode (non-drag)
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (connectMode && onConnectClick) {
      e.stopPropagation();
      onConnectClick(route.id);
    }
    // Normal clicks handled in mouseUp of drag logic
  }, [connectMode, onConnectClick, route.id]);

  const posX = localPos ? localPos.x : (route.x ?? 0);
  const posY = localPos ? localPos.y : (route.y ?? 0);
  const isDragging = localPos !== null;

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={connectMode ? handleClick : undefined}
      className={`absolute select-none transition-all ${
        isDragging ? 'cursor-grabbing z-50' : draggable && !connectMode ? 'cursor-grab' : 'cursor-pointer'
      }`}
      style={{
        left: posX * scale,
        top: posY * scale,
        width: 180 * scale,
        height: 80 * scale,
        transform: isDragging ? 'scale(1.08)' : isSelected ? 'scale(1.05)' : 'scale(1)',
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
        transition: isDragging ? 'none' : undefined,
      }}
    >
      <div
        className={`w-full h-full rounded-lg border-2 transition-all duration-200 ease-out ${
          isDragging
            ? 'shadow-xl shadow-purple-500/30'
            : isSelected
            ? 'shadow-lg shadow-blue-500/20'
            : connectMode
            ? 'shadow-md shadow-purple-500/20 hover:shadow-purple-500/40'
            : 'hover:shadow-md hover:shadow-slate-900/60'
        }`}
        style={{
          backgroundColor: isConnectSource ? 'rgb(59 7 100)' : isDragging ? 'rgb(30 41 59)' : 'rgb(30 41 59)',
          borderColor: isDragging
            ? '#a855f7'
            : isConnectSource
            ? '#a855f7'
            : connectMode
            ? `${categoryConfig.color}aa`
            : isSelected
            ? categoryConfig.color
            : `${categoryConfig.color}66`,
        }}
      >
        <div
          className="flex flex-col justify-between h-full overflow-hidden"
          style={{ padding: `${6 * scale}px ${8 * scale}px` }}
        >
          {/* Top row: status dot + component name + auth/drag badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`flex-shrink-0 rounded-full ${statusConfig.dot}`}
              style={{
                width: 6 * scale,
                height: 6 * scale,
              }}
            />
            <span
              className="font-semibold text-slate-100 truncate flex-1"
              style={{ fontSize: 11 * scale }}
            >
              {route.component}
            </span>
            {connectMode ? (
              <Link
                size={10 * scale}
                className="text-purple-400 flex-shrink-0 animate-pulse"
              />
            ) : draggable ? (
              <GripVertical
                size={10 * scale}
                className="text-slate-600 flex-shrink-0 opacity-0 group-hover:opacity-100"
              />
            ) : route.requiresAuth ? (
              <Lock
                size={10 * scale}
                className="text-amber-400 flex-shrink-0"
              />
            ) : (
              <Unlock
                size={10 * scale}
                className="text-slate-600 flex-shrink-0"
              />
            )}
          </div>

          {/* Path */}
          <p
            className="text-slate-400 truncate leading-tight"
            style={{ fontSize: 9 * scale }}
          >
            {route.path}
          </p>

          {/* Bottom row: category badge + status label */}
          <div className="flex items-center justify-between">
            <span
              className="rounded px-1 py-0.5 font-medium truncate"
              style={{
                fontSize: 8 * scale,
                backgroundColor: `${categoryConfig.color}22`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
            <span
              className="font-medium"
              style={{
                fontSize: 8 * scale,
                color: statusConfig.color,
              }}
            >
              {connectMode && isConnectSource ? 'Origem' : statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
