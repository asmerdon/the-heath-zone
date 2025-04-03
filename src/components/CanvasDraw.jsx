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

  const getRandomColor = () => {
    const hue = 180 + Math.random() * 40;
    const sat = 80 + Math.random() * 15;
    const light = 45 + Math.random() * 15;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
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
    setIsDrawing(true);
    setHoldData({ x: e.clientX, y: e.clientY, time: Date.now() });
    strokeColor.current = getRandomColor();
    currentLine.current = [];
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevPoint.current = null;
    setHoldData(null);

    if (currentLine.current.length > 0 && onLineDrawn) {
      onLineDrawn(currentLine.current);
      currentLine.current = [];
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
      if (onLineDrawn) {
        onLineDrawn([]);
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