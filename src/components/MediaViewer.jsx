import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import WindowFrame from './WindowFrame';
import { useResponsiveWindow } from '../useViewport';
import '../styles/WindowStyles.css';

export default function MediaViewer({ items, startIndex, onClose, onPositionChange }) {
  const [index, setIndex] = useState(startIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [forceZIndex, setForceZIndex] = useState(false);
  const windowRef = useRef();

  // Scale the viewer to the current screen, keeping the desktop size
  // when there's room and shrinking to fit on smaller screens/laptops.
  const responsive = useResponsiveWindow({
    preferredWidth: 900,
    preferredHeight: 900,
  });

  // Memoized window style
  const windowStyle = useMemo(() => ({
    width: `${responsive.width}px`,
    height: `${responsive.height}px`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }), [responsive.width, responsive.height]);

  // Reset index when items change
  useEffect(() => {
    setIndex(startIndex);
    // Force z-index update
    setForceZIndex(true);
    const timer = setTimeout(() => setForceZIndex(false), 0);
    return () => clearTimeout(timer);
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
    } else {
      setIsLoading(false);
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
  }, [items]);

  const nextItem = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
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

  return (
    <WindowFrame
      ref={windowRef}
      title="Viewer"
      onClose={onClose}
      defaultPosition={{ x: responsive.x, y: responsive.y }}
      onPositionChange={onPositionChange}
      style={windowStyle}
      forceZIndex={forceZIndex}
    >
      <div 
        className="media-viewer"
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
