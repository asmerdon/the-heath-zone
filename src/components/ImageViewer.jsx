import WindowFrame from './WindowFrame';
import { useState } from 'react';

export default function ImageViewer({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);

  const next = () => setIndex((index + 1) % images.length);
  const prev = () => setIndex((index - 1 + images.length) % images.length);

  return (
    <WindowFrame title="Viewer" onClose={onClose} defaultPosition={{ x: 200, y: 200 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={images[index]}
          alt=""
          style={{ maxWidth: '400px', maxHeight: '300px', borderRadius: '8px' }}
        />
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
          <button onClick={prev} style={navBtn}>←</button>
          <button onClick={next} style={navBtn}>→</button>
        </div>
      </div>
    </WindowFrame>
  );
}

const navBtn = {
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#fff',
  padding: '0.3rem 1rem',
  borderRadius: '6px',
  cursor: 'pointer'
};
