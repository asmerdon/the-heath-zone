import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

const CanvasDraw = forwardRef(({ onLineDrawn }, ref) => {
  const canvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const prevPoint = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [holdData, setHoldData] = useState(null);
  const activeDrips = useRef([]);
  const strokeColor = useRef(null);
  const currentLine = useRef([]);
  const firstPoint = useRef(null);
  const globalFirstPoint = useRef(null);

  const getRandomColor = () => {
    const hue = 180 + Math.random() * 40;
    const sat = 80 + Math.random() * 15;
    const light = 45 + Math.random() * 15;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

  const drawFlag = (ctx, x, y) => {
    const flagHeight = 30;
    const flagWidth = 20;
    
    const offsetX = 10;
    const offsetY = 10;
    const flagX = x + offsetX;
    const flagY = y - offsetY;
    
    ctx.save();
    
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.lineTo(flagX, flagY - flagHeight);
    ctx.strokeStyle = '#11C3DB';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(flagX, flagY - flagHeight);
    ctx.lineTo(flagX + flagWidth, flagY - flagHeight + flagWidth/2);
    ctx.lineTo(flagX, flagY - flagHeight + flagWidth);
    ctx.fillStyle = '#11C3DB';
    ctx.fill();
    
    if (globalFirstPoint.current) {
      globalFirstPoint.current = { x: flagX, y: flagY };
    }
    
    ctx.restore();
  };

  const updateFlag = () => {
    if (!globalFirstPoint.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    drawFlag(ctx, globalFirstPoint.current.x, globalFirstPoint.current.y);
  };

  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      [canvasRef, trailCanvasRef].forEach(ref => {
        if (ref.current) {
          ref.current.width = w;
          ref.current.height = h;
        }
      });
      updateFlag();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handlePointerMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const drawCtx = canvasRef.current.getContext('2d');
    const trailCtx = trailCanvasRef.current.getContext('2d');

    if (isDrawing && prevPoint.current) {
      drawCtx.beginPath();
      drawCtx.moveTo(prevPoint.current.x, prevPoint.current.y);
      drawCtx.lineTo(x, y);
      drawCtx.strokeStyle = strokeColor.current;
      drawCtx.lineWidth = 10;
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.shadowColor = 'rgba(255,255,255,0.25)';
      drawCtx.shadowBlur = 2;
      drawCtx.stroke();

      currentLine.current.push({
        x1: prevPoint.current.x,
        y1: prevPoint.current.y,
        x2: x,
        y2: y,
        width: 10,
        color: strokeColor.current
      });
    } else if (!isDrawing && prevPoint.current) {
      const dx = x - prevPoint.current.x;
      const dy = y - prevPoint.current.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.floor(dist / 2);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const ix = prevPoint.current.x + dx * t;
        const iy = prevPoint.current.y + dy * t;
        const color = getRandomColor();
        trailCtx.beginPath();
        trailCtx.arc(ix, iy, 2, 0, 2 * Math.PI);
        trailCtx.fillStyle = color;
        trailCtx.fill();

        setTimeout(() => {
          trailCtx.clearRect(ix - 3, iy - 3, 6, 6);
        }, 100);
      }
    }

    if (isDrawing) {
      const movedFar = !prevPoint.current
        ? false
        : Math.hypot(x - prevPoint.current.x, y - prevPoint.current.y) > 8;

      if (movedFar) {
        setHoldData({ x, y, time: Date.now() });
      } else {
        setHoldData((prev) => ({ ...prev, x, y }));
      }
    }

    prevPoint.current = { x, y };
  };

  const handlePointerDown = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setIsDrawing(true);
    setHoldData({ x, y, time: Date.now() });
    strokeColor.current = getRandomColor();
    currentLine.current = [];
    firstPoint.current = { x, y };

    // Only set globalFirstPoint and draw flag if this is the first line
    if (!globalFirstPoint.current) {
      // Offset the spawn point slightly to better align with the line
      globalFirstPoint.current = { 
        x: x + 10, // Move spawn point right
        y: y - 5   // Move spawn point up
      };
      const ctx = canvasRef.current.getContext('2d');
      drawFlag(ctx, x, y);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevPoint.current = null;
    setHoldData(null);

    if (currentLine.current.length > 0 && onLineDrawn) {
      onLineDrawn(currentLine.current, globalFirstPoint.current);
      currentLine.current = [];
      firstPoint.current = null;
    }
  };

  useEffect(() => {
    if (!isDrawing || !holdData) return;
    const interval = setInterval(() => {
      const heldFor = Date.now() - holdData.time;
      if (heldFor > 300) {
        const newDrip = {
          x: holdData.x + (Math.random() - 0.5) * 10,
          y: holdData.y + Math.random() * 10,
          radius: 3 + Math.random() * 2,
          color: getRandomColor(),
          velocity: 0.5 + Math.random() * 0.5,
          decay: 0.97,
        };
        activeDrips.current.push(newDrip);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isDrawing, holdData]);

  useEffect(() => {
    const animate = () => {
      const ctx = canvasRef.current.getContext('2d');
      activeDrips.current = activeDrips.current.filter((drip) => {
        drip.y += drip.velocity;
        drip.radius *= drip.decay;
        if (drip.radius < 0.3) return false;
        ctx.beginPath();
        ctx.arc(drip.x, drip.y, drip.radius, 0, 2 * Math.PI);
        ctx.fillStyle = drip.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.fill();
        return true;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      trailCanvasRef.current.getContext('2d').clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);
      activeDrips.current = [];
      currentLine.current = [];
      firstPoint.current = null;
      globalFirstPoint.current = null;
      if (onLineDrawn) {
        onLineDrawn([], null);
      }
    }
  }));

  return (
    <>
      <canvas
        ref={trailCanvasRef}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }}
      />
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000, pointerEvents: 'auto', cursor: 'none' }}
      />
    </>
  );
});

export default CanvasDraw;