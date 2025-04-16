import { useState, useEffect, useCallback, useMemo } from 'react';
import WindowFrame from './WindowFrame';
import { getNextZIndex } from '../zIndexManager';
import '../styles/WindowStyles.css';

export default function MediaViewer({ items, startIndex, onClose, onPositionChange }) {
  const [index, setIndex] = useState(startIndex);
  const [currentZ, setCurrentZ] = useState(getNextZIndex());
  const [isLoading, setIsLoading] = useState(true);

  // Reset index when items change and bring to front
  useEffect(() => {
    setIndex(startIndex);
    setCurrentZ(getNextZIndex());
  }, [items, startIndex]);

  // Preload next and previous images
  useEffect(() => {
    const preloadImage = (url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    };

    // Preload current image
    const currentItem = items[index];
    if (currentItem?.type === 'image') {
      setIsLoading(true);
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.src = currentItem.url;
    }

    // Preload next and previous images
    const nextIndex = (index + 1) % items.length;
    const prevIndex = (index - 1 + items.length) % items.length;
    
    if (items[nextIndex]?.type === 'image') {
      preloadImage(items[nextIndex].url);
    }
    if (items[prevIndex]?.type === 'image') {
      preloadImage(items[prevIndex].url);
    }
  }, [items, index]);

  const prevItem = useCallback(() => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
    setCurrentZ(getNextZIndex());
  }, [items]);

  const nextItem = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
    setCurrentZ(getNextZIndex());
  }, [items]);

  // Add keyboard navigation with proper cleanup
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        prevItem();
      } else if (e.key === 'ArrowRight') {
        nextItem();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [prevItem, nextItem, onClose]);

  // Guard against undefined items
  if (!items || !items[index]) {
    onClose();
    return null;
  }

  const currentItem = items[index];

  // Memoized window style
  const windowStyle = useMemo(() => ({
    width: '900px',
    height: '900px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: currentZ,
  }), [currentZ]);

  return (
    <WindowFrame
      title="Viewer"
      onClose={onClose}
      defaultPosition={{ x: 1200, y: 100 }}
      onPositionChange={onPositionChange}
      style={windowStyle}
    >
      <div 
        className="media-viewer"
        onMouseDown={() => setCurrentZ(getNextZIndex())}
      >
        <div className="media-content">
          {isLoading && currentItem.type === 'image' && (
            <div className="loading-indicator">Loading...</div>
          )}
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url}
              alt=""
              className="media-image"
              style={{ opacity: isLoading ? 0 : 1 }}
            />
          ) : (
            <video
              src={currentItem.url}
              controls
              autoPlay
              className="media-video"
            />
          )}
        </div>

        <div className="media-controls">
          <button onClick={prevItem} className="nav-button">←</button>
          <button onClick={nextItem} className="nav-button">→</button>
        </div>
      </div>
    </WindowFrame>
  );
}
