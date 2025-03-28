import React from 'react';

export default function Taskbar({ onClear, onShowSplash, onToggleBackground }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 1100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      className="ui-block"
    >
      <button style={buttonStyle} onClick={onClear}>Clear</button>
      <button style={buttonStyle} onClick={onShowSplash}>Welcome</button>
      <button style={buttonStyle} onClick={onToggleBackground}>Toggle BG</button>
      <input type="range" min={0} max={1} step={0.01} style={sliderStyle} />
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 0.9rem',
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.8rem',
  fontWeight: 500,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  cursor: 'default',
  transition: 'all 0.2s ease',
};

const sliderStyle = {
  width: '100px',
  cursor: 'pointer',
  accentColor: '#ffffff',
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '8px',
  height: '6px',
  marginLeft: '8px'
};
