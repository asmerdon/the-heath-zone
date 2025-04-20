import { memo, useState } from 'react';

const Background = memo(({ showBackground }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <>
      {/* Static Background */}
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
          opacity: showBackground ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      {/* Video Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          opacity: showBackground ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src="bg-loop-compressed.mp4"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isVideoLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
        {/* Show static background while video loads */}
        {!isVideoLoaded && showBackground && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url(background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </div>
      {/* Mist Overlay */}
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