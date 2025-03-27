import CanvasDraw from './components/CanvasDraw';
import './App.css';
import { useEffect } from 'react';

export default function App() {
  // Add custom cursor CSS via JS (for now)
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    const move = (e) => {
      const target = e.target;
      const isOverUI = target.closest('.ui-block');
      cursor.style.display = isOverUI ? 'none' : 'block';
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', move);

    return () => {
      window.removeEventListener('mousemove', move);
      cursor.remove();
    };
  }, []);

  return (
    <>
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/bg-loop.mp4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />

      {/* Glass UI card */}
      <div className="ui-block" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '2rem 3rem',
        color: 'white',
        textAlign: 'center',
        zIndex: 1001,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          The Heath Zone
        </h1>
        <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
          artist based in se london
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="https://soundcloud.com/user-952972706" target="_blank" rel="noopener noreferrer" style={glassBtn}>Beats</a>
          <a href="https://www.mixcloud.com/Altwych/" target="_blank" rel="noopener noreferrer" style={glassBtn}>Radio Show</a>
          <a href="https://www.are.na/the-heath/channels" target="_blank" rel="noopener noreferrer" style={glassBtn}>Are.na</a>
          <a href="#" style={glassBtn}>Artwork</a>
        </div>
      </div>

      <CanvasDraw />

      {/* Custom cursor styling */}
      <style>{`
        #custom-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: radial-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 0 6px rgba(255,255,255,0.3);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          pointer-events: none;
          z-index: 2000;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease-out;
        }

        a:hover {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 1px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(1px);
        }

        a:active {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 1px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(2px);
        }
      `}</style>
    </>
  );
}

const glassBtn = {
  padding: '0.6rem 1.2rem',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  fontSize: '0.9rem',
  textDecoration: 'none',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease',
};
