import { useState, useCallback, useRef, useEffect } from 'react';

interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

export function usePanZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [state, setState] = useState<PanZoomState>({ x: 0, y: 0, scale: 0.6 });
  const isPanning = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 2) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.2) }));
  }, []);

  const resetZoom = useCallback(() => {
    setState({ x: 0, y: 0, scale: 0.6 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    startPoint.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: state.x, y: state.y };
  }, [state.x, state.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - startPoint.current.x;
    const dy = e.clientY - startPoint.current.y;
    setState(prev => ({
      ...prev,
      x: startOffset.current.x + dx,
      y: startOffset.current.y + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setState(prev => ({
        ...prev,
        scale: Math.max(0.2, Math.min(2, prev.scale + delta)),
      }));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef]);

  return {
    ...state,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setPosition: (x: number, y: number) => setState(prev => ({ ...prev, x, y })),
  };
}
