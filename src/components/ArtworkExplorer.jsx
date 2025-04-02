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
              key={col.name}
              onClick={() => setSelectedCollection(col)}
              className="folder-thumb"
              style={{
                cursor: 'pointer',
                width: '160px',
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
                  height: '120px',
                  backgroundImage: col.items?.length ? `url(${col.items[0].type === 'image' ? col.items[0].url : col.items[0].thumbnail})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.5rem',
                }}
              >
                {!col.items?.length && '📁'}
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
          
          {/* Description section */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          >
            <p style={{ 
              margin: 0,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              textAlign: 'left'
            }}>
              {selectedCollection.description}
            </p>
          </div>

          <div className="gallery-container" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 200px)',
            gap: '1rem',
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '0.5rem',
            paddingRight: '1rem',
            justifyContent: 'center',
          }}>
            {selectedCollection.items.map((item, index) => (
              <div
                key={index}
                onClick={() => onOpenImage(selectedCollection.items, index)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={item.type === 'image' ? item.url : item.thumbnail}
                  alt=""
                  className="gallery-thumb"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
                {item.type === 'video' && (
                  <div className="video-play-button">
                    <div style={{
                      width: '0',
                      height: '0',
                      borderTop: '12px solid transparent',
                      borderBottom: '12px solid transparent',
                      borderLeft: '20px solid rgba(255, 255, 255, 0.9)',
                      marginLeft: '4px',
                    }} />
                  </div>
                )}
              </div>
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
