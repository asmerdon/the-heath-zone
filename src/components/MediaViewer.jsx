import WindowFrame from './WindowFrame';
import { useState, useEffect } from 'react';

export default function MediaViewer({ items, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, items]);

  const prevItem = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextItem = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const currentItem = items[index];

  return (
    <WindowFrame
      title="Viewer"
      onClose={onClose}
      defaultPosition={{ x: 1200, y: 100 }}
      style={{
        width: '900px',
        height: '900px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        {/* Media section */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
          }}
        >
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 0 12px rgba(0,0,0,0.2)',
              }}
            />
          ) : (
            <video
              src={currentItem.url}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 0 12px rgba(0,0,0,0.2)',
              }}
            />
          )}
        </div>

        {/* Button section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            paddingBottom: '1rem',
          }}
        >
          <button onClick={prevItem} className="glass-button" style={navBtnStyle}>←</button>
          <button onClick={nextItem} className="glass-button" style={navBtnStyle}>→</button>
        </div>
      </div>
    </WindowFrame>
  );
}

const navBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'white',
  fontSize: '1.1rem',
  cursor: 'pointer',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  border: '1px solid rgba(255,255,255,0.3)',
};
