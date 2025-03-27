import { useEffect, useRef, useState } from 'react';

const CanvasDraw = () => {
  const canvasRef = useRef(null);       // Main canvas (draw + drip)
  const trailCanvasRef = useRef(null);  // Separate trail canvas
  const prevPoint = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [holdData, setHoldData] = useState(null);
  const activeDrips = useRef([]);
  const strokeColor = useRef(null);     // Persistent stroke color for realism

  // Resize both canvases on load/resize
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

  const getRandomColor = () => {
    const hue = 180 + Math.random() * 40;
    const sat = 80 + Math.random() * 15;
    const light = 45 + Math.random() * 15;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

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
    } else if (!isDrawing) {
      if (prevPoint.current) {
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
          }, 1000);
        }
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
    strokeColor.current = getRandomColor(); // store consistent stroke color
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    prevPoint.current = null;
    setHoldData(null);
  };

  // Add new drip every few milliseconds while holding
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

  // Animate drips over time
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

  const clearCanvas = () => {
    const drawCtx = canvasRef.current.getContext('2d');
    const trailCtx = trailCanvasRef.current.getContext('2d');
    drawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    trailCtx.clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);
    activeDrips.current = [];
  };

  return (
    <>
      <canvas
        ref={trailCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          pointerEvents: 'auto',
          cursor: 'none',
        }}
      />
      <button
        onClick={clearCanvas}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1100,
          padding: '10px 15px',
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        Clear Drawing
      </button>
    </>
  );
};

export default CanvasDraw;
