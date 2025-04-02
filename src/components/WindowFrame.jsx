import { useRef, useState, useEffect } from 'react';
import { getNextZIndex } from '../zIndexManager';

export default function WindowFrame({ title, children, onClose, defaultPosition, style = {} }) {
  const windowRef = useRef();
  const [position, setPosition] = useState(defaultPosition || { x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [currentZ, setCurrentZ] = useState(getNextZIndex()); // ✨ this is new

  const handleMouseDown = (e) => {
    const rect = windowRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
    setCurrentZ(getNextZIndex()); // ✨ this brings it to front
  };


  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

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
  }, [dragging]);

  return (
    <div
      ref={windowRef}
      className="window-frame"
      onMouseDown={() => setCurrentZ(getNextZIndex())}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: 'white',
        zIndex: currentZ,
        boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
        ...style, // 👈 This allows ImageViewer to control width/height
      }}
    >

      <div
        className="window-titlebar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(17, 195, 219, 0.17)',
          cursor: 'move',
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
        onMouseDown={handleMouseDown}
      >
        <span>{title}</span>
        <button
          onClick={onClose}
          class="glass-button"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            marginLeft: '0.5rem',
          }}
        >
          ✕
        </button>
      </div>
      <div
        style={{
          padding: '1rem',
          height: 'calc(100% - 42px)', // Account for titlebar height
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </div>
    </div>
  );
}
