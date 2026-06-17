import { useState, useEffect } from 'react';

// Tracks the current browser viewport size so windows can scale
// to whatever screen the site is being viewed on.
export function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return viewport;
}

// Returns a window size that never exceeds the available viewport,
// keeping the preferred (desktop) size when there's room for it.
export function useResponsiveWindow({
  preferredWidth,
  preferredHeight,
  widthRatio = 0.9,
  heightRatio = 0.85,
  minWidth = 280,
  minHeight = 220,
}) {
  const { width: vw, height: vh } = useViewport();

  const width = Math.max(minWidth, Math.min(preferredWidth, vw * widthRatio));
  const height = Math.max(minHeight, Math.min(preferredHeight, vh * heightRatio));

  // Centered position based on the actual (clamped) size.
  const x = Math.max(0, (vw - width) / 2);
  const y = Math.max(0, (vh - height) / 2);

  return { width, height, x, y };
}
