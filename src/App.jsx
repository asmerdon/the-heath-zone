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

// Window positioning system
const getWindowPosition = (index, windowType) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isSmallScreen = screenWidth < 768;
  
  // Base window dimensions
  const windowWidth = windowType === 'splash' ? 550 : 800;
  const windowHeight = windowType === 'splash' ? 300 : 600;
  
  // Calculate center position
  const centerX = (screenWidth - windowWidth) / 2;
  const centerY = (screenHeight - windowHeight) / 2;
  
  if (isSmallScreen) {
    // On small screens, center all windows
    return { x: centerX, y: centerY };
  }
  
  // On larger screens, create a staggered pattern
  const offset = 30; // Stagger offset
  const maxOffset = 200; // Maximum offset from center
  
  // Calculate staggered position
  const staggerX = Math.min(offset * index, maxOffset);
  const staggerY = Math.min(offset * index, maxOffset);
  
  return {
    x: centerX + staggerX,
    y: centerY + staggerY
  };
};

export default function App() {
  // State management
  const [showSplash, setShowSplash] = useState(true);
  const [showBackground, setShowBackground] = useState(true);
  const [showArtwork, setShowArtwork] = useState(false);
  const [showPhotography, setShowPhotography] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const [windowCount, setWindowCount] = useState(0);
  
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

  // Handle window opening
  const handleOpenWindow = (setter) => {
    setWindowCount(prev => prev + 1);
    setter(true);
  };

  // Memoized splash window content
  const splashContent = useMemo(() => (
    <div className="ui-window" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 className="window-title">The Heath Zone</h2>
      <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>artist based in se london</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <a onClick={() => handleOpenWindow(setShowArtwork)} className="glass-button">Artwork</a>
        <a onClick={() => handleOpenWindow(setShowPhotography)} className="glass-button">Photography</a>
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
          defaultPosition={getWindowPosition(0, 'splash')}
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
          defaultPosition={getWindowPosition(1, 'media')}
          onPositionChange={handleWindowUpdate}
        />
      )}

      {showPhotography && (
        <MediaExplorer
          title="Photography"
          collections={photographyCollections}
          onClose={() => setShowPhotography(false)}
          onOpenImage={(images, index) => setViewerData({ images, index })}
          defaultPosition={getWindowPosition(2, 'media')}
          onPositionChange={handleWindowUpdate}
        />
      )}

      {viewerData && (
        <MediaViewer
          items={viewerData.images}
          startIndex={viewerData.index}
          onClose={() => setViewerData(null)}
          onPositionChange={handleWindowUpdate}
          defaultPosition={getWindowPosition(windowCount, 'viewer')}
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

