import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

// Physics game component for marble and line interactions
const MarbleGame = forwardRef(({ onWindowUpdate }, ref) => {
  // Refs for Matter.js engine and objects
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const linesRef = useRef([]); // Store line segments for physics
  const marblesRef = useRef([]); // Store marble bodies
  const spawnPointRef = useRef(null);
  const windowBodiesRef = useRef(new Map()); // Store window physics bodies
  const MAX_MARBLES = 50; // Maximum number of marbles allowed at once
  const wallsRef = useRef([]); // Store wall references

  // Convert a line segment to a Matter.js physics body
  const createLineBody = (line) => {
    const thickness = line.width;
    const length = Math.sqrt(
      Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2)
    );
    
    if (length < 5) return null; // Skip very short lines

    // Calculate center point
    const centerX = (line.x1 + line.x2) / 2;
    const centerY = (line.y1 + line.y2) / 2;

    // Calculate angle
    const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);

    // Create the line body
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

    // If lines is empty, clear all existing lines
    if (lines.length === 0) {
      linesRef.current.forEach(line => {
        Matter.World.remove(engine.world, line);
      });
      linesRef.current = [];
      spawnPointRef.current = null;
      return;
    }

    // Store the spawn point only if we don't have one yet
    if (spawnPoint && !spawnPointRef.current) {
      spawnPointRef.current = spawnPoint;
    }

    // Convert new lines to physics bodies
    const bodies = lines
      .map(createLineBody)
      .filter(body => body !== null);

    // Add new bodies to the world
    Matter.World.add(engine.world, bodies);
    linesRef.current.push(...bodies);
  };

  // Create or update window physics bodies for UI interaction
  const handleWindowUpdate = ({ id, x, y, width, height, removed }) => {
    const engine = engineRef.current;
    if (!engine) return;

    // Remove existing body if it exists
    const existingBody = windowBodiesRef.current.get(id);
    if (existingBody) {
      Matter.World.remove(engine.world, existingBody);
      windowBodiesRef.current.delete(id);
    }

    // If window was removed, we're done
    if (removed) return;

    // Create new body for window with physics properties
    const body = Matter.Bodies.rectangle(
      x + width / 2,  // Center position
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
        chamfer: { radius: 10 }, // Rounded corners
        friction: 0.05, // Reduced friction
        restitution: 0.9, // Increased bounciness
        slop: 0 // Perfect collision detection
      }
    );

    Matter.World.add(engine.world, body);
    windowBodiesRef.current.set(id, body);
  };

  // Initialize Matter.js physics engine and setup
  useEffect(() => {
    // Initialize Matter.js engine with higher precision
    const engine = Matter.Engine.create({
      enableSleeping: false,
      constraintIterations: 4
    });
    engineRef.current = engine;

    // Create renderer with transparent background
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

    // Set up gravity with reduced scale
    engine.world.gravity.y = 1;
    engine.world.gravity.scale = 0.0008;

    // Create invisible walls to keep marbles in bounds
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      friction: 0,
      restitution: 0.8
    };

    // Create side walls
    const leftWall = Matter.Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);
    const rightWall = Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);
    
    // Store wall references
    const walls = [leftWall, rightWall];
    wallsRef.current = walls;

    Matter.World.add(engine.world, walls);

    // Create physics runner at 60 FPS
    const runner = Matter.Runner.create({
      isFixed: true,
      delta: 1000 / 60
    });
    runnerRef.current = runner;

    // Start physics simulation
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Handle window resize
    const handleResize = () => {
      const canvas = render.canvas;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update render bounds
      render.bounds.max.x = width;
      render.bounds.max.y = height;
      
      // Update canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Update canvas style
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      // Remove old walls
      if (wallsRef.current) {
        Matter.World.remove(engine.world, wallsRef.current);
      }

      // Create new walls with current dimensions
      const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, wallOptions);
      const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions);
      
      // Update wall references
      wallsRef.current = [leftWall, rightWall];
      
      // Add new walls to world
      Matter.World.add(engine.world, wallsRef.current);

      // Clean up marbles that fall off screen
      marblesRef.current.forEach(marble => {
        if (marble.position.y > height + 100) {
          Matter.World.remove(engine.world, marble);
          marblesRef.current = marblesRef.current.filter(m => m !== marble);
        }
      });
    };
    window.addEventListener('resize', handleResize);

    // Cleanup physics engine on unmount
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    spawnMarble: () => {
      const engine = engineRef.current;
      if (!engine || !spawnPointRef.current) {
        console.error('Physics engine not initialized or no spawn point set');
        return;
      }

      // Remove oldest marble if at maximum
      if (marblesRef.current.length >= MAX_MARBLES) {
        const oldestMarble = marblesRef.current.shift();
        if (oldestMarble) {
          Matter.World.remove(engine.world, oldestMarble);
        }
      }

      // Get direction from first line segment
      const firstLine = linesRef.current[0];
      
      // Create marble at spawn point
      const spawnHeight = 50;
      const spawnX = spawnPointRef.current.x;
      const spawnY = spawnPointRef.current.y - spawnHeight;

      // Create marble with physics properties
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

      if (firstLine) {
        const vertices = firstLine.vertices;
        
        // Calculate normalized direction vector
        const dx = vertices[1].x - vertices[0].x;
        const dy = vertices[1].y - vertices[0].y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / length;
        const dirY = dy / length;

        // Set initial velocity with slight downward bias
        const speed = 2;
        const downwardBias = 0.2;
        Matter.Body.setVelocity(marble, {
          x: dirX * speed,
          y: Math.max(0.1, dirY) * speed + downwardBias
        });
      } else {
        // If no line, just drop straight down
        Matter.Body.setVelocity(marble, {
          x: 0,
          y: 2
        });
      }

      Matter.World.add(engine.world, marble);
      marblesRef.current.push(marble);

      // Clean up marbles that fall off screen
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

  // Create glass marble texture with gradients
  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Main sphere gradient with transparency
    const gradient = ctx.createRadialGradient(100, 80, 10, 100, 100, 100);
    gradient.addColorStop(0, 'rgba(17, 195, 219, 0.7)');
    gradient.addColorStop(0.3, 'rgba(17, 195, 219, 0.6)');
    gradient.addColorStop(0.5, 'rgba(17, 195, 219, 0.5)');
    gradient.addColorStop(0.7, 'rgba(17, 195, 219, 0.4)');
    gradient.addColorStop(1, 'rgba(17, 195, 219, 0.3)');

    // Draw main sphere
    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add main highlight
    const highlightGradient = ctx.createRadialGradient(70, 70, 0, 70, 70, 50);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(70, 70, 40, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // Add secondary highlight
    const smallHighlight = ctx.createRadialGradient(130, 130, 0, 130, 130, 20);
    smallHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    smallHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(130, 130, 20, 0, Math.PI * 2);
    ctx.fillStyle = smallHighlight;
    ctx.fill();

    // Add edge highlight
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