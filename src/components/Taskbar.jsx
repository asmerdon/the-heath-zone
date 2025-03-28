import React from 'react';

export default function Taskbar({ onClear }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        left: 'auto',
        transform: 'none',
        display: 'flex',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '16px',
        padding: '0.5rem 1rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      className="ui-block"
    >
      <button
        onClick={onClear}
        style={buttonStyle}
      >
        Clear Drawing
      </button>
      {/* More buttons can go here in future */}
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 1rem',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: '#fff',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'default',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'all 0.2s ease',
};
