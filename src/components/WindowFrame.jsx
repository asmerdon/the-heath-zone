import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { getNextZIndex } from '../zIndexManager';
import WindowTitlebar from './WindowTitlebar';
import '../styles/WindowStyles.css';

// Debounce function
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export default function WindowFrame({ title, children, onClose, defaultPosition, style = {}, onPositionChange }) {
  const windowRef = useRef();
  const [position, setPosition] = useState(defaultPosition || { x: 100, y: 100 });
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [currentZ, setCurrentZ] = useState(getNextZIndex());

  // Memoized position style
  const positionStyle = useMemo(() => ({
    left: position.x,
    top: position.y,
    zIndex: currentZ,
    ...style,
  }), [position.x, position.y, currentZ, style]);

  // Debounced size update
  const debouncedUpdateSize = useCallback(
    debounce(() => {
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
        onPositionChange?.({ 
          x: position.x, 
          y: position.y, 
          width: rect.width, 
          height: rect.height,
          id: title
        });
      }
    }, 100),
    [position.x, position.y, title]
  );

  // Track window size and send initial position
  useEffect(() => {
    // Initial update with RAF to ensure DOM is ready
    requestAnimationFrame(() => {
      debouncedUpdateSize();
    });

    // Also update on resize
    window.addEventListener('resize', debouncedUpdateSize);
    return () => {
      window.removeEventListener('resize', debouncedUpdateSize);
      // Notify parent when window is unmounted
      onPositionChange?.({ id: title, removed: true });
    };
  }, [debouncedUpdateSize, title, onPositionChange]);

  const handleMouseDown = useCallback((e) => {
    const rect = windowRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    setCurrentZ(getNextZIndex());
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const newPosition = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      };
      setPosition(newPosition);
      // Notify parent of position update
      onPositionChange?.({ 
        ...newPosition, 
        width: size.width, 
        height: size.height,
        id: title
      });
    }
  }, [dragging, offset.x, offset.y, size.width, size.height, title, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={windowRef}
      className="window-frame"
      onMouseDown={() => setCurrentZ(getNextZIndex())}
      style={positionStyle}
    >
      <WindowTitlebar
        title={title}
        onClose={onClose}
        onMouseDown={handleMouseDown}
      />
      <div className="window-content">
        {children}
      </div>
    </div>
  );
}
