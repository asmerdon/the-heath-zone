import { memo, useState, useEffect } from 'react';

const Background = memo(({ showBackground }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Reset video loaded state when toggling background
  useEffect(() => {
    if (!showBackground) {
      setIsVideoLoaded(false);
    }
  }, [showBackground]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -2,
          opacity: showBackground && isVideoLoaded ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          opacity: showBackground && isVideoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src="bg-loop.mkv"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(4, 5, 5, 0.12)', // light white mist
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
});

Background.displayName = 'Background';
export default Background; 