import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

// Canvas component for drawing lines and handling pointer events
const CanvasDraw = forwardRef(({ onLineDrawn }, ref) => {
  // Refs for canvas elements and drawing state
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
  const drawnLines = useRef([]); // Store all drawn lines that have been converted to physics

  // Generate random color in cyan/blue hue range
  const getRandomColor = () => {
    const hue = 180 + Math.random() * 40;
    const sat = 80 + Math.random() * 15;
    const light = 45 + Math.random() * 15;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

  // Draw flag indicator at starting point
  const drawFlag = (ctx, x, y) => {
    const flagHeight = 30;
    const flagWidth = 20;
    
    const offsetX = 10;
    const offsetY = 10;
    const flagX = x + offsetX;
    const flagY = y - offsetY;
    
    ctx.save();
    
    // Draw flag pole
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.lineTo(flagX, flagY - flagHeight);
    ctx.strokeStyle = '#11C3DB';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw flag triangle
    ctx.beginPath();
    ctx.moveTo(flagX, flagY - flagHeight);
    ctx.lineTo(flagX + flagWidth, flagY - flagHeight + flagWidth/2);
    ctx.lineTo(flagX, flagY - flagHeight + flagWidth);
    ctx.fillStyle = '#11C3DB';
    ctx.fill();
    
    // Store flag position for marble spawning
    if (!globalFirstPoint.current) {
      globalFirstPoint.current = { x: flagX, y: flagY };
    }
    
    ctx.restore();
  };

  // Redraw flag when needed (e.g. on resize)
  const updateFlag = () => {
    if (!globalFirstPoint.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    drawFlag(ctx, globalFirstPoint.current.x, globalFirstPoint.current.y);
  };

  // Redraw current lines
  const redrawCurrentLines = () => {
    if (!currentLine.current.length) return;
    
    const ctx = canvasRef.current.getContext('2d');
    currentLine.current.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255,255,255,0.25)';
      ctx.shadowBlur = 2;
      ctx.stroke();
    });
  };

  // Initialize canvas size
  useEffect(() => {
    const initializeCanvas = () => {
      [canvasRef, trailCanvasRef].forEach(ref => {
        if (ref.current) {
          const canvas = ref.current;
          // Set canvas size to match window dimensions
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          // Set display size
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      });
    };

    // Initialize immediately
    initializeCanvas();
  }, []); // Empty dependency array for initialization

  // Handle window resize separately
  useEffect(() => {
    const handleResize = () => {
      [canvasRef, trailCanvasRef].forEach(ref => {
        if (ref.current) {
          const canvas = ref.current;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      });
      updateFlag();
      
      // Redraw all previously drawn lines
      const ctx = canvasRef.current.getContext('2d');
      drawnLines.current.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255,255,255,0.25)';
        ctx.shadowBlur = 2;
        ctx.stroke();
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle pointer movement for drawing and effects
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates in canvas space
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const drawCtx = canvasRef.current.getContext('2d');
    const trailCtx = trailCanvasRef.current.getContext('2d');

    // Draw line if currently drawing
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

      // Store line segment for physics
      currentLine.current.push({
        x1: prevPoint.current.x,
        y1: prevPoint.current.y,
        x2: x,
        y2: y,
        width: 10,
        color: strokeColor.current
      });
    } else if (!isDrawing && prevPoint.current) {
      // Create trail effect when moving without drawing
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

        // Fade out trail particles
        setTimeout(() => {
          trailCtx.clearRect(ix - 3, iy - 3, 6, 6);
        }, 25);
      }
    }

    // Handle drip effect when holding still
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

  // Start drawing on pointer down
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates in canvas space
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setHoldData({ x, y, time: Date.now() });
    strokeColor.current = getRandomColor();
    currentLine.current = [];
    firstPoint.current = { x, y };

    // Create flag on first draw
    if (!globalFirstPoint.current) {
      globalFirstPoint.current = { 
        x: x + 10,
        y: y - 5
      };
      const ctx = canvasRef.current.getContext('2d');
      drawFlag(ctx, x, y);
    }
  };

  // End drawing and convert to physics objects
  const handlePointerUp = () => {
    setIsDrawing(false);
    prevPoint.current = null;
    setHoldData(null);

    if (currentLine.current.length > 0 && onLineDrawn) {
      // Store the lines before clearing them
      drawnLines.current.push(...currentLine.current);
      onLineDrawn(currentLine.current, globalFirstPoint.current);
      currentLine.current = [];
      firstPoint.current = null;
    }
  };

  // Create drip effect when holding still
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

  // Animate drips falling
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

  // Expose canvas clearing function
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      trailCanvasRef.current.getContext('2d').clearRect(0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height);
      activeDrips.current = [];
      currentLine.current = [];
      drawnLines.current = []; // Clear stored lines
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