import CanvasDraw from './components/CanvasDraw';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import ArtworkExplorer from './components/ArtworkExplorer';
import ImageViewer from './components/ImageViewer';
import './App.css';
import { useEffect, useState, useRef } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const canvasRef = useRef();

  // Custom cursor logic
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

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <>
      {/* Background video */}
      {showBackground && (
      <>
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
            zIndex: -2,
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(4, 5, 5, 0.08)', // light white mist
            zIndex: -1,
            pointerEvents: 'none',
          }}
        />
      </>
    )}

      <Taskbar
        onClear={handleClearCanvas}
        onShowSplash={() => setShowSplash(true)}
        onToggleBackground={() => setShowBackground((prev) => !prev)}
      />

      {/* Splash window as draggable Aero-style panel */}
      {showSplash && (
        <WindowFrame
          title="Welcome"
          onClose={() => setShowSplash(false)}
          defaultPosition={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }}
        >
          <div className="ui-window" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>The Heath Zone</h2>
            <p style={{ marginBottom: '1.5rem' }}>artist based in se london</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="https://soundcloud.com/user-952972706" target="_blank" rel="noopener noreferrer" style={glassBtn}>Beats</a>
              <a href="https://www.mixcloud.com/Altwych/" target="_blank" rel="noopener noreferrer" style={glassBtn}>Radio Show</a>
              <a href="https://www.are.na/the-heath/channels" target="_blank" rel="noopener noreferrer" style={glassBtn}>Are.na</a>
              <a onClick={() => setShowArtwork(true)} style={glassBtn}>Artwork</a>
            </div>
          </div>
        </WindowFrame>
      )}

      {showArtwork && (
        <ArtworkExplorer
          onClose={() => setShowArtwork(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
        />
      )}

      {viewerData && (
        <ImageViewer
          images={viewerData.images}
          startIndex={viewerData.index}
          onClose={() => setViewerData(null)}
        />
      )}


      <CanvasDraw ref={canvasRef} />

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

        * {
          cursor: default !important;
        }

        .window-frame .titlebar {
          background: linear-gradient(to right, rgba(0, 255, 200, 0.35), rgba(0, 150, 255, 0.25));
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        .ui-window {
          user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
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

        input[type="range"] {
          appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 5px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
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
  textAlign: 'center',
  whiteSpace: 'nowrap',
  flex: '0 0 auto'
};
