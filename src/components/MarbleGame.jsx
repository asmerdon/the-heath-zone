import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

const MarbleGame = forwardRef(({ onWindowUpdate }, ref) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const linesRef = useRef([]); // Store line segments for physics
  const marblesRef = useRef([]); // Store marble bodies
  const spawnPointRef = useRef(null);
  const windowBodiesRef = useRef(new Map()); // Store window physics bodies
  const MAX_MARBLES = 50; // Maximum number of marbles allowed at once

  // Function to convert a line segment to a physics body
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

  // Function to handle new line segments and spawn point
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

  // Function to create or update a window physics body
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

    // Create new body for window
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

  useEffect(() => {
    // Initialize Matter.js engine with higher precision
    const engine = Matter.Engine.create({
      enableSleeping: false,
      constraintIterations: 4
    });
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      canvas: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: 'auto'
      }
    });
    renderRef.current = render;

    // Set up stronger gravity
    engine.world.gravity.y = 1;
    engine.world.gravity.scale = 0.0008; // Slightly reduced gravity

    // Create walls to keep marbles in bounds
    const wallOptions = {
      isStatic: true,
      render: { visible: false },
      friction: 0,
      restitution: 0.8
    };

    // Create walls (only sides, no bottom)
    const walls = [
      Matter.Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions), // left
      Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions), // right
    ];

    // Add walls to the world
    Matter.World.add(engine.world, walls);

    // Create and start the runner
    const runner = Matter.Runner.create({
      isFixed: true,
      delta: 1000 / 60 // Run at 60 FPS
    });
    runnerRef.current = runner;

    // Start the engine and renderer
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Handle window resize
    const handleResize = () => {
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
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

      // Check if we've reached the maximum number of marbles
      if (marblesRef.current.length >= MAX_MARBLES) {
        // Remove the oldest marble
        const oldestMarble = marblesRef.current.shift();
        if (oldestMarble) {
          Matter.World.remove(engine.world, oldestMarble);
        }
      }

      // Get the first line segment to determine direction
      const firstLine = linesRef.current[0];
      if (!firstLine) return;

      // Get the first line's vertices
      const vertices = firstLine.vertices;
      
      // Calculate direction vector of the first line segment
      const dx = vertices[1].x - vertices[0].x;
      const dy = vertices[1].y - vertices[0].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize direction vector
      const dirX = dx / length;
      const dirY = dy / length;

      const spawnHeight = 50;
      const spawnX = spawnPointRef.current.x;
      const spawnY = spawnPointRef.current.y - spawnHeight;

      const marble = Matter.Bodies.circle(spawnX, spawnY, 10, {
        restitution: 0.8, // Increased from 0.6
        friction: 0.001, // Reduced friction
        density: 0.001, // Reduced density for more reactive movement
        frictionAir: 0.0001, // Reduced air friction
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

      // Set initial velocity with a downward bias
      const speed = 2; // Reduced initial speed for better control
      const downwardBias = 0.2; // Reduced downward bias
      Matter.Body.setVelocity(marble, {
        x: dirX * speed,
        y: Math.max(0.1, dirY) * speed + downwardBias
      });

      Matter.World.add(engine.world, marble);
      marblesRef.current.push(marble); // Add to our marble tracking array

      // Clean up marbles that fall off screen
      const cleanupInterval = setInterval(() => {
        if (marble.position.y > window.innerHeight + 50) {
          Matter.World.remove(engine.world, marble);
          marblesRef.current = marblesRef.current.filter(m => m !== marble);
          clearInterval(cleanupInterval);
        }
      }, 1000); // Check every second instead of waiting 10 seconds
    },
    handleNewLines,
    handleWindowUpdate // Expose window update function
  }));

  // Create a glass marble texture
  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for the main sphere with higher opacity
    const gradient = ctx.createRadialGradient(100, 80, 10, 100, 100, 100);
    gradient.addColorStop(0, 'rgba(17, 195, 219, 0.7)');  // More opaque center
    gradient.addColorStop(0.3, 'rgba(17, 195, 219, 0.6)');
    gradient.addColorStop(0.5, 'rgba(17, 195, 219, 0.5)');
    gradient.addColorStop(0.7, 'rgba(17, 195, 219, 0.4)');
    gradient.addColorStop(1, 'rgba(17, 195, 219, 0.3)');  // More visible edge

    // Draw the main sphere
    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add stronger highlight
    const highlightGradient = ctx.createRadialGradient(70, 70, 0, 70, 70, 50);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');  // Brighter highlight
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(70, 70, 40, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();

    // Add a brighter small highlight
    const smallHighlight = ctx.createRadialGradient(130, 130, 0, 130, 130, 20);
    smallHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');  // Brighter small highlight
    smallHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.arc(130, 130, 20, 0, Math.PI * 2);
    ctx.fillStyle = smallHighlight;
    ctx.fill();

    // Add stronger edge highlight
    ctx.beginPath();
    ctx.arc(100, 100, 98, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(17, 195, 219, 0.8)';  // More visible edge
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