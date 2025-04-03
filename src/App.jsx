import { useEffect, useState, useRef, useMemo } from 'react';
import CanvasDraw from './components/CanvasDraw';
import WindowFrame from './components/WindowFrame';
import Taskbar from './components/Taskbar';
import MediaExplorer from './components/MediaExplorer';
import MediaViewer from './components/MediaViewer';
import MarbleGame from './components/MarbleGame';
import Background from './components/Background';
import CustomCursor from './components/CustomCursor';
import { artworkCollections } from './collections/artwork';
import { photographyCollections } from './collections/photography';
import './App.css';

export default function App() {
  // State management
  const [showSplash, setShowSplash] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);
  const [showPhotography, setShowPhotography] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  
  // Refs
  const canvasRef = useRef();
  const marbleGameRef = useRef();

  // Memoized handlers
  const handleClearCanvas = useMemo(() => () => {
    canvasRef.current?.clearCanvas();
  }, []);

  const handleSpawnMarble = useMemo(() => () => {
    marbleGameRef.current?.spawnMarble();
  }, []);

  const handleWindowUpdate = useMemo(() => (update) => {
    marbleGameRef.current?.handleWindowUpdate(update);
  }, []);

  const handleNewLines = useMemo(() => (lines, spawnPoint) => {
    marbleGameRef.current?.handleNewLines(lines, spawnPoint);
  }, []);

  // Memoized splash window content
  const splashContent = useMemo(() => (
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
  ), []);

  return (
    <>
      <CustomCursor />
      <Background showBackground={showBackground} />

      <Taskbar
        onClear={handleClearCanvas}
        onShowSplash={() => setShowSplash(true)}
        onToggleBackground={() => setShowBackground(prev => !prev)}
        onSpawnMarble={handleSpawnMarble}
      />

      {/* Splash window */}
      {showSplash && (
        <WindowFrame
          title="About"
          onClose={() => setShowSplash(false)}
          defaultPosition={{ x: window.innerWidth / 2 - 275, y: window.innerHeight / 2 - 150 }}
          onPositionChange={handleWindowUpdate}
        >
          {splashContent}
        </WindowFrame>
      )}

      {/* Media windows */}
      {showArtwork && (
        <MediaExplorer
          title="Artwork"
          collections={artworkCollections}
          onClose={() => setShowArtwork(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
          defaultPosition={{ x: 350, y: 350 }}
          onPositionChange={handleWindowUpdate}
        />
      )}

      {showPhotography && (
        <MediaExplorer
          title="Photography"
          collections={photographyCollections}
          onClose={() => setShowPhotography(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
          defaultPosition={{ x: 450, y: 450 }}
          onPositionChange={handleWindowUpdate}
        />
      )}

      {viewerData && (
        <MediaViewer
          items={viewerData.images}
          startIndex={viewerData.index}
          onClose={() => setViewerData(null)}
          onPositionChange={handleWindowUpdate}
        />
      )}

      <MarbleGame ref={marbleGameRef} />
      <CanvasDraw 
        ref={canvasRef} 
        onLineDrawn={handleNewLines}
      />
    </>
  );
}

