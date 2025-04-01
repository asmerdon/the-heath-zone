import { useState } from 'react';
import WindowFrame from './WindowFrame';
import { artworkCollections } from '../collections';

export default function ArtworkExplorer({ onClose, onOpenImage }) {
  const [selectedCollection, setSelectedCollection] = useState(null);

  return (
    <WindowFrame
      title={selectedCollection ? selectedCollection.name : 'Artwork'}
      onClose={onClose}
      defaultPosition={{ x: 350, y: 350 }}
    >
      {!selectedCollection ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1rem' }}>
          {artworkCollections.map((col) => (
            <div
              key={col.folder}
              onClick={() => setSelectedCollection(col)}
              className="folder-thumb"
              style={{
                cursor: 'pointer',
                width: '120px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.08)',
                padding: '0.5rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  backgroundImage: col.images.length ? `url(${col.images[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', // fallback bg
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.5rem',
                }}
              >
                {!col.images.length && '📁'}
              </div>

              <p style={{ color: '#fff', fontSize: '0.9rem' }}>{col.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
          <button
            onClick={() => setSelectedCollection(null)}
            className="glass-button"
            style={{ alignSelf: 'flex-start' }}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {selectedCollection.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="gallery-thumb"
                onClick={() => onOpenImage(selectedCollection.images, index)}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
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
