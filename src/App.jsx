import CanvasDraw from './components/CanvasDraw';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import ArtworkExplorer from './components/ArtworkExplorer';
import MediaViewer from './components/MediaViewer';
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
          src="/bg-loop.mkv"
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
            background: 'rgba(4, 5, 5, 0.12)', // light white mist
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
          title="About"
          onClose={() => setShowSplash(false)}
          defaultPosition={{ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }}
        >
          <div className="ui-window" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>The Heath Zone</h2>
            <p style={{ marginBottom: '1.5rem' }}>artist based in se london</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a onClick={() => setShowArtwork(true)} className="glass-button">Artwork</a>
              <a href="https://soundcloud.com/user-952972706" target="_blank" rel="noopener noreferrer" className="glass-button">Beats</a>
              <a href="https://www.mixcloud.com/Altwych/" target="_blank" rel="noopener noreferrer" className="glass-button">Radio Show</a>
              <a href="https://www.are.na/the-heath/channels" target="_blank" rel="noopener noreferrer" className="glass-button">Are.na</a>
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
        <MediaViewer
          items={viewerData.images}
          startIndex={viewerData.index}
          onClose={() => setViewerData(null)}
        />
      )}

      <CanvasDraw ref={canvasRef} />

    </>
  );
}

