"use client";

import { useState, useRef, useEffect } from "react";

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  onDragStart?: (id: string) => void;
  onDrop?: (id: string) => void;
  onResize?: (id: string, width: string, height: string) => void;
  className?: string;
  isResizable?: boolean;
  initialWidth?: string;
  initialHeight?: string;
}

export default function DraggableCard({
  id,
  children,
  isEditMode,
  onDragStart,
  onDrop,
  onResize,
  className = "",
  isResizable = true,
  initialWidth = "auto",
  initialHeight = "auto",
}: DraggableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", id);
    if (onDragStart) onDragStart(id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/html");
    if (draggedId !== id && onDrop) {
      onDrop(draggedId);
    }
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (!isEditMode || !isResizable) return;
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      resizeStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      };
    }
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;

      const newWidth = Math.max(200, resizeStartPos.current.width + deltaX);
      const newHeight = Math.max(100, resizeStartPos.current.height + deltaY);

      const widthPx = `${newWidth}px`;
      const heightPx = size.height !== "auto" ? `${newHeight}px` : "auto";

      setSize({ width: widthPx, height: heightPx });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (onResize) {
        onResize(id, size.width, size.height);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, id, onResize, size.width, size.height]);

  return (
    <div
      ref={cardRef}
      draggable={isEditMode && !isResizing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        width: size.width,
        height: size.height,
      }}
      className={`
        ${className}
        ${
          isEditMode
            ? "cursor-move border-2 border-dashed border-blue-400 hover:border-blue-600 rounded-lg"
            : ""
        }
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isResizing ? "pointer-events-auto" : ""}
        transition-all duration-200
        relative
      `}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
            {isResizing ? "Resizing..." : "Drag to Move"}
          </div>
        </div>
      )}

      <div className={isResizing ? "pointer-events-none" : ""}>{children}</div>

      {isEditMode && isResizable && (
        <>
          {/* Bottom-right resize handle */}
          <div
            className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 rounded cursor-se-resize hover:bg-blue-700 flex items-center justify-center shadow-lg z-50"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8l4 4m0 0l4-4m-4 4V4m8 12l-4-4m0 0l4-4m-4 4h12"
              />
            </svg>
          </div>

          {/* Right edge resize handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-16 bg-blue-500 rounded-l cursor-e-resize hover:bg-blue-600 shadow z-50"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />

          {/* Bottom edge resize handle */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-16 bg-blue-500 rounded-t cursor-s-resize hover:bg-blue-600 shadow z-50"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
        </>
      )}
    </div>
  );
}
