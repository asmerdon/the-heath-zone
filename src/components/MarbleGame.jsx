import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

// Physics game component for marble and line interactions
const MarbleGame = forwardRef(({ onWindowUpdate, size }, ref) => {
  // Refs for Matter.js engine and objects
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const linesRef = useRef([]);
  const marblesRef = useRef([]);
  const spawnPointRef = useRef(null);
  const windowBodiesRef = useRef(new Map());
  const MAX_MARBLES = 50;
  const wallsRef = useRef([]);

  // Convert a line segment to a Matter.js physics body
  const createLineBody = (line) => {
    const thickness = line.width;
    const length = Math.sqrt(
      Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2)
    );
    
    if (length < 5) return null;

    const centerX = (line.x1 + line.x2) / 2;
    const centerY = (line.y1 + line.y2) / 2;
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);

    return Matter.Bodies.rectangle(centerX, centerY, length, thickness, {
      isStatic: true,
      angle: angle,
      render: {
        fillStyle: line.color,
        strokeStyle: line.color,
        lineWidth: 0
      },
      friction: 0.1,
      restitution: 0.5
    });
  };

  // Handle new line segments and spawn point updates
  const handleNewLines = (lines, spawnPoint) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (lines.length === 0) {
      linesRef.current.forEach(line => {
        Matter.World.remove(engine.world, line);
      });
      linesRef.current = [];
      spawnPointRef.current = null;
      return;
    }

    if (spawnPoint && !spawnPointRef.current) {
      spawnPointRef.current = spawnPoint;
    }

    const bodies = lines
      .map(createLineBody)
      .filter(body => body !== null);

    Matter.World.add(engine.world, bodies);
    linesRef.current.push(...bodies);
  };

  // Create or update window physics bodies
  const handleWindowUpdate = ({ id, x, y, width, height, removed }) => {
    const engine = engineRef.current;
    if (!engine) return;

    const existingBody = windowBodiesRef.current.get(id);
    if (existingBody) {
      Matter.World.remove(engine.world, existingBody);
      windowBodiesRef.current.delete(id);
    }

    if (removed) return;

    const body = Matter.Bodies.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      {
        isStatic: true,
        render: {
          fillStyle: 'rgba(255, 255, 255, 0.0)',
          strokeStyle: 'rgba(255, 255, 255, 0.0)',
          lineWidth: 0
        },
        chamfer: { radius: 10 },
        friction: 0.05,
        restitution: 0.9,
        slop: 0
      }
    );

    Matter.World.add(engine.world, body);
    windowBodiesRef.current.set(id, body);
  };

  // Initialize Matter.js physics engine and setup
  useEffect(() => {
    const engine = Matter.Engine.create({
      enableSleeping: false,
      constraintIterations: 4
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    });
    renderRef.current = render;

    engine.world.gravity.y = 1;
    engine.world.gravity.scale = 0.0008;

    const createWalls = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const wallThickness = 60;

      // Remove existing walls if any
      if (wallsRef.current) {
        Matter.World.remove(engine.world, wallsRef.current);
      }

      const walls = [
        Matter.Bodies.rectangle( // Left wall
          -wallThickness/2, height/2, wallThickness, height * 2,
          { isStatic: true, label: 'leftWall', render: { visible: false } }
        ),
        Matter.Bodies.rectangle( // Right wall
          width + wallThickness/2, height/2, wallThickness, height * 2,
          { isStatic: true, label: 'rightWall', render: { visible: false } }
        )
      ];

      wallsRef.current = walls;
      Matter.World.add(engine.world, walls);
    };

    // Initial wall creation
    createWalls();

    const runner = Matter.Runner.create({
      isFixed: true,
      delta: 1000 / 60
    });
    runnerRef.current = runner;

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    const handleResize = () => {
      const canvas = render.canvas;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      render.bounds.max.x = width;
      render.bounds.max.y = height;
      
      canvas.width = width;
      canvas.height = height;
      
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      // Update walls
      createWalls();

      // Clean up marbles that are out of bounds
      marblesRef.current.forEach(marble => {
        if (marble.position.y > height + 100) {
          Matter.World.remove(engine.world, marble);
          marblesRef.current = marblesRef.current.filter(m => m !== marble);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update canvas size when parent size changes
  useEffect(() => {
    if (sceneRef.current && size) {
      sceneRef.current.width = size.width;
      sceneRef.current.height = size.height;
      
      const event = new Event('resize');
      window.dispatchEvent(event);
    }
  }, [size?.width, size?.height]);

  useImperativeHandle(ref, () => ({
    spawnMarble: () => {
      const engine = engineRef.current;
      if (!engine || !spawnPointRef.current) {
        console.error('Physics engine not initialized or no spawn point set');
        return;
      }

      if (marblesRef.current.length >= MAX_MARBLES) {
        const oldestMarble = marblesRef.current.shift();
        if (oldestMarble) {
          Matter.World.remove(engine.world, oldestMarble);
        }
      }

      const firstLine = linesRef.current[0];
      if (!firstLine) return;

      const vertices = firstLine.vertices;
      
      const dx = vertices[1].x - vertices[0].x;
      const dy = vertices[1].y - vertices[0].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const dirX = dx / length;
      const dirY = dy / length;

      const spawnHeight = 50;
      const spawnX = spawnPointRef.current.x;
      const spawnY = spawnPointRef.current.y - spawnHeight;

      const marble = Matter.Bodies.circle(spawnX, spawnY, 10, {
        restitution: 0.8,
        friction: 0.001,
        density: 0.001,
        frictionAir: 0.0001,
        render: {
          fillStyle: 'transparent',
          strokeStyle: '#11C3DB',
          lineWidth: 2,
          sprite: {
            texture: createMarbleTexture(),
            xScale: 0.1,
            yScale: 0.1
          }
        }
      });

      const speed = 2;
      const downwardBias = 0.2;
      Matter.Body.setVelocity(marble, {
        x: dirX * speed,
        y: Math.max(0.1, dirY) * speed + downwardBias
      });

      Matter.World.add(engine.world, marble);
      marblesRef.current.push(marble);

      const cleanupInterval = setInterval(() => {
        if (marble.position.y > window.innerHeight + 50) {
          Matter.World.remove(engine.world, marble);
          marblesRef.current = marblesRef.current.filter(m => m !== marble);
          clearInterval(cleanupInterval);
        }
      }, 1000);
    },
    handleNewLines,
    handleWindowUpdate
  }));

  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(100, 80, 10, 100, 100, 100);
    gradient.addColorStop(0, 'rgba(17, 195, 219, 0.7)');
    gradient.addColorStop(0.3, 'rgba(17, 195, 219, 0.6)');
    gradient.addColorStop(0.5, 'rgba(17, 195, 219, 0.5)');
    gradient.addColorStop(0.7, 'rgba(17, 195, 219, 0.4)');
    gradient.addColorStop(1, 'rgba(17, 195, 219, 0.3)');

    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    const highlightGradient = ctx.createRadialGradient(70, 70, 0, 70, 70, 50);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(70, 70, 40, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    const smallHighlight = ctx.createRadialGradient(130, 130, 0, 130, 130, 20);
    smallHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    smallHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(130, 130, 20, 0, Math.PI * 2);
    ctx.fillStyle = smallHighlight;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(17, 195, 219, 0.8)';
    ctx.lineWidth = 4;
    ctx.stroke();

    return canvas.toDataURL();
  };

  return (
    <canvas
      ref={sceneRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1001,
        pointerEvents: 'none',
      }}
    />
  );
});

export default MarbleGame; 