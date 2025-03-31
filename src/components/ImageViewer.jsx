import WindowFrame from './WindowFrame';
import { useState } from 'react';

export default function ImageViewer({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

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
        overflow: 'hidden', // prevent content from spilling out
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
        {/* Image section */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem', // adds space for the buttons
          }}
        >
          <img
            src={images[index]}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 0 12px rgba(0,0,0,0.2)',
            }}
          />
        </div>

        {/* Button section (will always be inside window now) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            paddingBottom: '1rem',
          }}
        >
          <button onClick={prevImage} style={navBtnStyle}>←</button>
          <button onClick={nextImage} style={navBtnStyle}>→</button>
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
