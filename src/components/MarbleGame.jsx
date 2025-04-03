import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';

const MarbleGame = forwardRef((props, ref) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const linesRef = useRef([]); // Store line segments for physics
  const marblesRef = useRef([]); // Store marble bodies

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
    engine.world.gravity.y = 0.8;
    engine.world.gravity.scale = 0.001;

    // Create walls to keep marbles in bounds
    const wallOptions = {
      isStatic: true,
      render: { visible: false }
    };

    // Create walls
    const walls = [
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, wallOptions), // bottom
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

  // Expose the spawnMarble function via ref
  useImperativeHandle(ref, () => ({
    spawnMarble: () => {
      const engine = engineRef.current;
      if (!engine) {
        console.error('Physics engine not initialized');
        return;
      }

      // Create a marble at the top of the screen with adjusted physics properties
      const marble = Matter.Bodies.circle(
        window.innerWidth / 2, // x position (center of screen)
        50, // y position (top of screen)
        15, // radius
        {
          restitution: 0.6, // slightly less bouncy
          friction: 0.1,
          density: 0.1,
          render: {
            fillStyle: '#11C3DB',
            opacity: 0.8
          }
        }
      );

      // Add some random initial velocity
      Matter.Body.setVelocity(marble, {
        x: (Math.random() - 0.5) * 5,
        y: 0
      });

      // Add the marble to the world
      Matter.World.add(engine.world, marble);
      marblesRef.current.push(marble);

      // Clean up marbles that fall off screen
      const cleanup = () => {
        marblesRef.current = marblesRef.current.filter(m => {
          if (m.position.y > window.innerHeight + 100) {
            Matter.World.remove(engine.world, m);
            return false;
          }
          return true;
        });
      };

      // Run cleanup periodically
      setTimeout(cleanup, 5000);
    }
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