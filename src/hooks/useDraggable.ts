import React, { useState, useEffect, useRef, useCallback } from "react";
import { safeStorage } from "../lib/storage";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableProps {
  storageKey: string;
  defaultCorner?: "bottom-left" | "bottom-right";
  defaultOffset?: { x: number; y: number };
  zIndex?: number;
}

export function useDraggable({
  storageKey,
  defaultCorner = "bottom-left",
  defaultOffset = { x: 24, y: 24 },
  zIndex = 50,
}: UseDraggableProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Refs for tracking drag state without re-triggering effects
  const isDraggingRef = useRef(false);
  const startMousePosRef = useRef<Position>({ x: 0, y: 0 });
  const startElemPosRef = useRef<Position>({ x: 0, y: 0 });
  const currentPosRef = useRef<Position | null>(null);
  const hasMovedRef = useRef(false);

  const offsetX = defaultOffset?.x ?? 24;
  const offsetY = defaultOffset?.y ?? 24;

  // Calculate default position based on corner and window dimensions
  const getDefaultPosition = useCallback((): Position => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 400;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    const elemW = dragRef.current ? dragRef.current.offsetWidth : 60;
    const elemH = dragRef.current ? dragRef.current.offsetHeight : 60;

    let x = offsetX;
    let y = winH - elemH - offsetY;

    if (defaultCorner === "bottom-right") {
      x = winW - elemW - offsetX;
    }

    return {
      x: Math.max(10, Math.min(winW - elemW - 10, x)),
      y: Math.max(10, Math.min(winH - elemH - 10, y)),
    };
  }, [defaultCorner, offsetX, offsetY]);

  // Load from localStorage or initialize default position
  useEffect(() => {
    let initialPos: Position | null = null;
    try {
      const saved = safeStorage.get(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          initialPos = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load dragged position from storage:", e);
    }

    if (!initialPos) {
      initialPos = getDefaultPosition();
    }

    setPosition(initialPos);
    currentPosRef.current = initialPos;
  }, [storageKey]);

  // Ensure bubble stays within window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      if (!currentPosRef.current) return;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const elemW = dragRef.current ? dragRef.current.offsetWidth : 60;
      const elemH = dragRef.current ? dragRef.current.offsetHeight : 60;

      const constrainedX = Math.max(10, Math.min(winW - elemW - 10, currentPosRef.current.x));
      const constrainedY = Math.max(10, Math.min(winH - elemH - 10, currentPosRef.current.y));

      if (constrainedX !== currentPosRef.current.x || constrainedY !== currentPosRef.current.y) {
        const newPos = { x: constrainedX, y: constrainedY };
        setPosition(newPos);
        currentPosRef.current = newPos;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStart = (clientX: number, clientY: number) => {
    if (!currentPosRef.current) {
      const defPos = getDefaultPosition();
      currentPosRef.current = defPos;
      setPosition(defPos);
    }
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startMousePosRef.current = { x: clientX, y: clientY };
    startElemPosRef.current = { ...currentPosRef.current };
    setIsDragging(true);
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    const dx = clientX - startMousePosRef.current.x;
    const dy = clientY - startMousePosRef.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const elemW = dragRef.current ? dragRef.current.offsetWidth : 60;
    const elemH = dragRef.current ? dragRef.current.offsetHeight : 60;

    let newX = startElemPosRef.current.x + dx;
    let newY = startElemPosRef.current.y + dy;

    // Keep inside screen viewport with 10px padding margin
    newX = Math.max(10, Math.min(winW - elemW - 10, newX));
    newY = Math.max(10, Math.min(winH - elemH - 10, newY));

    const nextPos = { x: newX, y: newY };
    currentPosRef.current = nextPos;
    setPosition(nextPos);
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (currentPosRef.current) {
      try {
        safeStorage.set(storageKey, JSON.stringify(currentPosRef.current));
      } catch (e) {
        console.error("Failed to save dragged position:", e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handleEnd();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && isDraggingRef.current) {
        if (hasMovedRef.current) {
          e.preventDefault(); // Prevent page scroll while dragging bubble
        }
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handleEnd();
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    handleStart(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Wrap button click handlers so they don't fire after a drag operation
  const handleClick = (callback: () => void) => (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    callback();
  };

  const resetPosition = () => {
    const def = getDefaultPosition();
    currentPosRef.current = def;
    setPosition(def);
    try {
      safeStorage.remove(storageKey);
    } catch (e) {
      console.error("Failed to remove storage key:", e);
    }
  };

  const style: React.CSSProperties = position
    ? {
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: "auto",
        right: "auto",
        zIndex,
      }
    : {
        position: "fixed",
        bottom: defaultCorner === "bottom-left" ? `${offsetY}px` : "auto",
        left: defaultCorner === "bottom-left" ? `${offsetX}px` : "auto",
        right: defaultCorner === "bottom-right" ? `${offsetX}px` : "auto",
        top: "auto",
        zIndex,
      };

  return {
    position,
    isDragging,
    dragRef,
    handlers: {
      onMouseDown,
      onTouchStart,
    },
    handleClick,
    resetPosition,
    style,
  };
}
