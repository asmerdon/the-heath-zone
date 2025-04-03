import { memo } from 'react';
import '../styles/WindowStyles.css';

const WindowTitlebar = memo(({ title, onClose, onMouseDown }) => {
  return (
    <div
      className="window-titlebar"
      onMouseDown={onMouseDown}
    >
      <span>{title}</span>
      <button
        onClick={onClose}
        className="close-button"
      >
        ✕
      </button>
    </div>
  );
});

WindowTitlebar.displayName = 'WindowTitlebar';
export default WindowTitlebar; 