import React from 'react';
import { Lock, Unlock } from 'lucide-react';
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
}

export default function RouteNode({
  route,
  isSelected,
  onClick,
  scale,
}: RouteNodeProps) {
  const categoryConfig = CATEGORY_CONFIG[route.category];
  const statusConfig = STATUS_CONFIG[route.status];

  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer select-none transition-all duration-200 ease-out"
      style={{
        left: (route.x ?? 0) * scale,
        top: (route.y ?? 0) * scale,
        width: 180 * scale,
        height: 80 * scale,
        transform: isSelected ? `scale(${1.05})` : 'scale(1)',
        zIndex: isSelected ? 20 : 10,
      }}
    >
      <div
        className={`w-full h-full rounded-lg border-2 transition-all duration-200 ease-out ${
          isSelected
            ? 'shadow-lg shadow-blue-500/20'
            : 'hover:shadow-md hover:shadow-slate-900/60'
        }`}
        style={{
          backgroundColor: 'rgb(30 41 59)', // bg-slate-800
          borderColor: isSelected
            ? categoryConfig.color
            : `${categoryConfig.color}66`,
        }}
      >
        <div
          className="flex flex-col justify-between h-full overflow-hidden"
          style={{ padding: `${6 * scale}px ${8 * scale}px` }}
        >
          {/* Top row: status dot + component name + auth badge */}
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
            {route.requiresAuth ? (
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
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
