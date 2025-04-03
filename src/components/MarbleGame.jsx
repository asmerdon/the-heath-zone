import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

const MarbleGame = forwardRef((props, ref) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const linesRef = useRef([]); // Store line segments for physics
  const marblesRef = useRef([]); // Store marble bodies
  const spawnPointRef = useRef(null);

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
    engine.world.gravity.scale = 0.001;

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

      // Calculate spawn position at the spawn point
      const spawnX = spawnPointRef.current.x;
      const spawnY = spawnPointRef.current.y;

      // Create a marble with adjusted physics properties
      const marble = Matter.Bodies.circle(
        spawnX,
        spawnY,
        10,
        {
          restitution: 0.6,
          friction: 0.001,
          frictionAir: 0.0001,
          density: 0.1,
          render: {
            fillStyle: '#11C3DB',
            opacity: 0.8
          }
        }
      );

      // Set initial velocity with a downward bias
      const speed = 2; // Reduced initial speed for better control
      const downwardBias = 0.2; // Reduced downward bias
      Matter.Body.setVelocity(marble, {
        x: dirX * speed,
        y: Math.max(0.1, dirY) * speed + downwardBias
      });

      // Add the marble to the world
      Matter.World.add(engine.world, marble);

      // Clean up marbles that fall off screen
      setTimeout(() => {
        if (marble.position.y > window.innerHeight + 50) {
          Matter.World.remove(engine.world, marble);
        }
      }, 10000); // Increased timeout to allow for longer falls
    },
    handleNewLines
  }));

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