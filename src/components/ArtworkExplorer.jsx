import { useState } from 'react';
import WindowFrame from './WindowFrame';
import { artworkCollections } from '../collections';

export default function ArtworkExplorer({ onClose, onOpenImage }) {
  const [selectedCollection, setSelectedCollection] = useState(null);

  return (
    <WindowFrame
      title={selectedCollection ? selectedCollection.name : 'Artwork'}
      onClose={onClose}
      defaultPosition={{ x: 150, y: 150 }}
    >
      {!selectedCollection && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {artworkCollections.map((col) => (
            <div
              key={col.folder}
              onClick={() => setSelectedCollection(col)}
              style={folderStyle}
            >
              📁 {col.name}
            </div>
          ))}
        </div>
      )}

      {selectedCollection && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => setSelectedCollection(null)} style={backBtnStyle}>← Back</button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {selectedCollection.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                onClick={() => onOpenImage(selectedCollection.images, index)}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </WindowFrame>
  );
}

const folderStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem'
};

const backBtnStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff',
  padding: '0.3rem 0.7rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
  cursor: 'pointer'
};
