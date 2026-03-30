import React, { useRef, useState, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  X,
  Minus,
  Circle,
  Triangle,
  MoveRight,
  Square,
} from "lucide-react";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// ── Types ────────────────────────────────────────────────────────────────────

type DrawTool = "pen" | "eraser";
type ShapeTool = "rect" | "circle" | "line" | "triangle" | "arrow";
type Tool = DrawTool | ShapeTool;

interface WhiteboardProps {
  onClose: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SHAPE_TOOLS: { tool: ShapeTool; icon: React.ReactNode; label: string }[] =
  [
    { tool: "rect", icon: <Square size={14} />, label: "Rectangle" },
    { tool: "circle", icon: <Circle size={14} />, label: "Circle" },
    { tool: "line", icon: <Minus size={14} />, label: "Line" },
    { tool: "triangle", icon: <Triangle size={14} />, label: "Triangle" },
    { tool: "arrow", icon: <MoveRight size={14} />, label: "Arrow" },
  ];

const SWATCHES: { cssVar: string; fallback: string }[] = [
  { cssVar: "--wb-swatch-1", fallback: "#ffffff" },
  { cssVar: "--wb-swatch-2", fallback: "#f472b6" },
  { cssVar: "--wb-swatch-3", fallback: "#818cf8" },
  { cssVar: "--wb-swatch-4", fallback: "#34d399" },
  { cssVar: "--wb-swatch-5", fallback: "#fbbf24" },
  { cssVar: "--wb-swatch-6", fallback: "#f87171" },
  { cssVar: "--wb-swatch-7", fallback: "#22d3ee" },
  { cssVar: "--wb-swatch-8", fallback: "#a78bfa" },
];

function resolveCSSVar(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return v || fallback;
}

// ── Component ────────────────────────────────────────────────────────────────

const Whiteboard: React.FC<WhiteboardProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(() =>
    resolveCSSVar("--wb-swatch-1", "#ffffff"),
  );
  const [brushSize, setBrushSize] = useState(3);
  const [activeSwatch, setActiveSwatch] = useState(0);

  const startPos = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const [stackVer, setStackVer] = useState(0);
  const bumpStack = () => setStackVer((v) => v + 1);

  const getCtx = useCallback(
    () => canvasRef.current?.getContext("2d") ?? null,
    [],
  );

  // ── History ────────────────────────────────────────────────────────────────

  const pushHistory = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    historyRef.current.push(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    );
    redoRef.current = [];
    bumpStack();
  }, [getCtx]);

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length === 0) return;
    redoRef.current.push(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    );
    ctx.putImageData(historyRef.current.pop()!, 0, 0);
    bumpStack();
  }, [getCtx]);

  const redo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || redoRef.current.length === 0) return;
    historyRef.current.push(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
    );
    ctx.putImageData(redoRef.current.pop()!, 0, 0);
    bumpStack();
  }, [getCtx]);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    historyRef.current = [];
    redoRef.current = [];
    bumpStack();
  }, [getCtx]);

  // ── Shape drawing ──────────────────────────────────────────────────────────

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      const sx = startPos.current.x;
      const sy = startPos.current.y;

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      switch (tool) {
        case "rect":
          ctx.strokeRect(sx, sy, x - sx, y - sy);
          return;

        case "circle": {
          const r = Math.hypot(x - sx, y - sy);
          ctx.arc(sx, sy, r, 0, 2 * Math.PI);
          break;
        }
        case "line":
          ctx.moveTo(sx, sy);
          ctx.lineTo(x, y);
          break;

        case "triangle":
          ctx.moveTo(sx, sy);
          ctx.lineTo(x, y);
          ctx.lineTo(sx - (x - sx), y);
          ctx.closePath();
          break;

        case "arrow": {
          const headLen = Math.max(12, brushSize * 4);
          const angle = Math.atan2(y - sy, x - sx);
          ctx.moveTo(sx, sy);
          ctx.lineTo(x, y);
          ctx.lineTo(
            x - headLen * Math.cos(angle - Math.PI / 6),
            y - headLen * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - headLen * Math.cos(angle + Math.PI / 6),
            y - headLen * Math.sin(angle + Math.PI / 6),
          );
          break;
        }
      }
      ctx.stroke();
    },
    [tool, color, brushSize],
  );

  // ── Mouse handlers ─────────────────────────────────────────────────────────

  const getCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;

    return { x, y };
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const ctx = getCtx();
      if (!ctx) return;

      pushHistory();

      const { x, y } = getCoords(e);
      startPos.current = { x, y };

      if (tool === "pen" || tool === "eraser") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height,
        );
      }

      setDrawing(true);
    },
    [getCtx, pushHistory, tool],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawing) return;
      const ctx = getCtx();
      if (!ctx) return;

      const { x, y } = getCoords(e);

      if (tool === "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineTo(x, y);
        ctx.stroke();
        return;
      }

      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = brushSize * 2; // smoother + more reliable
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineTo(x, y);
        ctx.stroke();
        return;
      }

      ctx.globalCompositeOperation = "source-over";
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      drawShape(ctx, x, y);
    },
    [drawing, getCtx, tool, color, brushSize, drawShape],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawing) return;
      const ctx = getCtx();
      if (!ctx) return;

      ctx.globalCompositeOperation = "source-over";

      if (tool !== "pen" && tool !== "eraser") {
        const { x, y } = getCoords(e);

        if (snapshotRef.current) {
          ctx.putImageData(snapshotRef.current, 0, 0);
        }
        drawShape(ctx, x, y);
        snapshotRef.current = null;
      }

      setDrawing(false);
    },
    [drawing, getCtx, tool, drawShape],
  );

  // ── Colour helpers ─────────────────────────────────────────────────────────

  const pickSwatch = (idx: number, cssVar: string, fallback: string) => {
    setColor(resolveCSSVar(cssVar, fallback));
    setActiveSwatch(idx);
  };

  const pickCustom = (hex: string) => {
    setColor(hex);
    setActiveSwatch(-1);
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const toolLabel = SHAPE_TOOLS.find((s) => s.tool === tool)?.label ?? tool;

  const cursor = tool === "eraser" ? "cell" : "crosshair";
  const canUndo = historyRef.current.length > 0;
  const canRedo = redoRef.current.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="wb-root">
      <div className="wb-toolbar">
        <span className="wb-title">Whiteboard</span>
        <div className="wb-divider" />
        <Button
          className={`wb-btn${tool === "pen" ? " active" : ""}`}
          onClick={() => setTool("pen")}
          title="Pen"
        >
          <Pencil size={14} />
        </Button>
        <Button
          className={`wb-btn${tool === "eraser" ? " active" : ""}`}
          onClick={() => setTool("eraser")}
          title="Eraser"
        >
          <Eraser size={14} />
        </Button>
        <div className="wb-divider" />
        {SHAPE_TOOLS.map(({ tool: st, icon, label }) => (
          <Button
            key={st}
            className={`wb-btn${tool === st ? " active" : ""}`}
            onClick={() => setTool(st)}
            title={label}
            variant="ghost"
            size="icon"
          >
            {icon}
          </Button>
        ))}
        <div className="wb-divider" />
        <div className="wb-swatches">
          {SWATCHES.map(({ cssVar, fallback }, i) => (
            <Button
              key={cssVar}
              className={`wb-swatch${activeSwatch === i ? " active" : ""} !h-6 !w-6 !p-0 rounded-full`}
              style={{ background: resolveCSSVar(cssVar, fallback) }}
              onClick={() => pickSwatch(i, cssVar, fallback)}
              title={fallback}
              variant="ghost"
              size="icon"
            />
          ))}
          <label
            className={`wb-custom-color${activeSwatch === -1 ? " active" : ""}`}
            title="Custom colour"
            style={activeSwatch === -1 ? { background: color } : undefined}
          >
            <Input
              type="color"
              value={color}
              onChange={(e) => pickCustom(e.target.value)}
              className="p-0 h-6 w-6 border-none cursor-pointer"
            />
            {activeSwatch !== -1 && <span>+</span>}
          </label>
        </div>
        <div className="wb-divider" />
        <span className="wb-label">Size</span>
        <Slider
          min={1}
          max={20}
          step={1}
          value={[brushSize]}
          onValueChange={(val) => setBrushSize(val[0])}
          className="w-32"
        />
        <span className="wb-size-out">{brushSize}</span>
        <div className="wb-divider" />
        <Button
          className="wb-btn"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          variant="ghost"
          size="icon"
        >
          <Undo2 size={14} />
        </Button>

        <Button
          className="wb-btn"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          variant="ghost"
          size="icon"
        >
          <Redo2 size={14} />
        </Button>

        <div className="wb-spacer" />

        <Button
          className="wb-btn-danger"
          onClick={clearCanvas}
          variant="destructive"
        >
          <Trash2 size={13} />
          Clear
        </Button>

        <Button
          className="wb-btn"
          onClick={onClose}
          title="Close"
          variant="ghost"
          size="icon"
        >
          <X size={14} />
        </Button>
      </div>

      <div className="wb-canvas-wrap">
        <div className="wb-canvas-grid" />
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="wb-canvas"
          style={{ cursor }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>

      <div className="wb-statusbar">
        <span className="wb-status-item">
          Tool: <span style={{ textTransform: "capitalize" }}>{toolLabel}</span>
        </span>
        <span
          className="wb-status-item"
          style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          Colour:
          <span
            style={{
              display: "inline-block",
              width: "0.6rem",
              height: "0.6rem",
              borderRadius: "50%",
              background: color,
            }}
          />
        </span>
        <span className="wb-status-item">
          Size: <span>{brushSize}px</span>
        </span>
        <div className="wb-spacer" />
        <span className="wb-status-item">
          {historyRef.current.length} step
          {historyRef.current.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default Whiteboard;
