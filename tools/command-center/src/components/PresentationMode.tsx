import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Lock,
  Unlock,
} from 'lucide-react';
import { DOCTOR_AUTO_ROUTES } from '../data/routes';
import { CATEGORY_CONFIG, RouteCategory, STATUS_CONFIG } from '../types/routes';

interface PresentationModeProps {
  active: boolean;
  onExit: () => void;
}

const CATEGORY_ORDER: RouteCategory[] = [
  'auth',
  'admin',
  'gestao',
  'cliente',
  'public',
  'dev',
  'orphan',
];

export default function PresentationMode({ active, onExit }: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Group routes by category
  const categories = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      key: cat,
      config: CATEGORY_CONFIG[cat],
      routes: DOCTOR_AUTO_ROUTES.filter((r) => r.category === cat),
    })).filter((group) => group.routes.length > 0);
  }, []);

  const currentCategory = categories[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, categories.length - 1));
  }, [categories.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onExit();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onExit, goNext, goPrev]);

  // Reset index when entering presentation mode
  useEffect(() => {
    if (active) {
      setCurrentIndex(0);
    }
  }, [active]);

  if (!active || !currentCategory) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === categories.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Presentation size={20} className="text-blue-400" />
          <span className="text-sm font-medium text-slate-400">
            Modo Apresentacao
          </span>
          <span className="text-xs text-slate-600 ml-2">
            ESC para sair | Setas para navegar
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {categories.map((cat, idx) => (
            <button
              key={cat.key}
              onClick={() => setCurrentIndex(idx)}
              className="transition-all"
              title={cat.config.label}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: idx === currentIndex ? 24 : 8,
                  height: 8,
                  backgroundColor:
                    idx === currentIndex ? cat.config.color : 'rgb(51, 65, 85)',
                }}
              />
            </button>
          ))}
        </div>

        <button
          onClick={onExit}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Sair (ESC)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentCategory.config.color }}
            />
            <h1
              className="text-3xl font-bold"
              style={{ color: currentCategory.config.color }}
            >
              {currentCategory.config.label}
            </h1>
            <span className="text-lg text-slate-500 font-medium">
              {currentCategory.routes.length} rotas
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Categoria {currentIndex + 1} de {categories.length}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCategory.routes.map((route) => {
              const statusCfg = STATUS_CONFIG[route.status];

              return (
                <div
                  key={route.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
                >
                  {/* Status + Auth badge row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                      <span
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    {route.requiresAuth ? (
                      <Lock size={12} className="text-blue-400" />
                    ) : (
                      <Unlock size={12} className="text-slate-600" />
                    )}
                  </div>

                  {/* Component name */}
                  <h3 className="text-sm font-semibold text-slate-100 mb-1 group-hover:text-white transition-colors">
                    {route.component}
                  </h3>

                  {/* Path */}
                  <code
                    className="text-xs font-mono px-1.5 py-0.5 rounded block truncate mb-2"
                    style={{
                      color: currentCategory.config.color,
                      backgroundColor: `${currentCategory.config.color}15`,
                    }}
                  >
                    {route.path}
                  </code>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {route.description}
                  </p>

                  {/* Roles */}
                  {route.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {route.roles.map((role) => (
                        <span
                          key={role}
                          className="text-[9px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* File */}
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-600 font-mono truncate block">
                      {route.fileName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFirst
              ? 'text-slate-700 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ChevronLeft size={18} />
          {!isFirst && categories[currentIndex - 1]?.config.label}
        </button>

        <span className="text-xs text-slate-600">
          Use as setas do teclado para navegar
        </span>

        <button
          onClick={goNext}
          disabled={isLast}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLast
              ? 'text-slate-700 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {!isLast && categories[currentIndex + 1]?.config.label}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
