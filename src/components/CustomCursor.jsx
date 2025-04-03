import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    const move = (e) => {
      const target = e.target;
      // Only hide cursor over buttons and interactive elements
      const isOverInteractive = target.closest('button, a, .glass-button, input, .gallery-thumb, .folder-thumb');
      cursor.style.display = isOverInteractive ? 'none' : 'block';
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', move);

    return () => {
      window.removeEventListener('mousemove', move);
      cursor.remove();
    };
  }, []);

  return null;
} 