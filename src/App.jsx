import CanvasDraw from './components/CanvasDraw';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import MediaExplorer from './components/MediaExplorer';
import MediaViewer from './components/MediaViewer';
import MarbleGame from './components/MarbleGame';
import { artworkCollections } from './collections/artwork';
import { photographyCollections } from './collections/photography';
import './App.css';
import { useEffect, useState, useRef } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);
  const [showPhotography, setShowPhotography] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const canvasRef = useRef();
  const marbleGameRef = useRef();

  // Custom cursor logic
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    const move = (e) => {
      const target = e.target;
      // Only hide cursor over buttons and interactive elements
      const isOverInteractive = target.closest('button, a, .glass-button, input, .gallery-thumb, .folder-thumb');
      cursor.style.display = isOverInteractive ? 'none' : 'block';
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

  const handleSpawnMarble = () => {
    if (marbleGameRef.current) {
      marbleGameRef.current.spawnMarble();
    }
  };

  return (
    <>
      {/* Background video or image */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2,
          opacity: showBackground ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          opacity: showBackground ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/bg-loop.mkv"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
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

      <Taskbar
        onClear={handleClearCanvas}
        onShowSplash={() => setShowSplash(true)}
        onToggleBackground={() => setShowBackground((prev) => !prev)}
        onSpawnMarble={handleSpawnMarble}
      />

      {/* Splash window as draggable Aero-style panel */}
      {showSplash && (
        <WindowFrame
          title="About"
          onClose={() => setShowSplash(false)}
          defaultPosition={{ x: window.innerWidth / 2 - 275, y: window.innerHeight / 2 - 150 }}
        >
          <div className="ui-window" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ margin: '0 0 0.5rem' }}>The Heath Zone</h2>
            <p style={{ marginBottom: '1.5rem' }}>artist based in se london</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a onClick={() => setShowArtwork(true)} className="glass-button">Artwork</a>
              <a onClick={() => setShowPhotography(true)} className="glass-button">Photography</a>
              <a href="https://soundcloud.com/user-952972706" target="_blank" rel="noopener noreferrer" className="glass-button">Beats</a>
              <a href="https://www.mixcloud.com/Altwych/" target="_blank" rel="noopener noreferrer" className="glass-button">Radio Show</a>
              <a href="https://www.are.na/the-heath/channels" target="_blank" rel="noopener noreferrer" className="glass-button">Are.na</a>
            </div>
          </div>
        </WindowFrame>
      )}

      {showArtwork && (
        <MediaExplorer
          title="Artwork"
          collections={artworkCollections}
          onClose={() => setShowArtwork(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
          defaultPosition={{ x: 350, y: 350 }}
        />
      )}

      {showPhotography && (
        <MediaExplorer
          title="Photography"
          collections={photographyCollections}
          onClose={() => setShowPhotography(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
          defaultPosition={{ x: 450, y: 450 }}
        />
      )}

      {viewerData && (
        <MediaViewer
          items={viewerData.images}
          startIndex={viewerData.index}
          onClose={() => setViewerData(null)}
        />
      )}

      <MarbleGame ref={marbleGameRef} />
      <CanvasDraw 
        ref={canvasRef} 
        onLineDrawn={(lines) => marbleGameRef.current?.handleNewLines(lines)}
      />
    </>
  );
}

