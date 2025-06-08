
import React, { useEffect, useState } from 'react';

export default function EstrelasCaindo() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setMounted(true);

    const starsCount = 300;
    const generatedStars = [];

    function randomRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < starsCount; i++) {
      const left = randomRange(0, 100);
      const delay = randomRange(0, 5);
      const duration = randomRange(7, 14);
      const size = Math.random() < 0.9 ? randomRange(0.5, 1.5) : randomRange(2, 3);
      const startTop = `-${randomRange(1, 20)}vh`;
      const opacity = randomRange(0.3, 0.8);

      generatedStars.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${left}vw`,
            top: startTop,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: 'white',
            opacity,
            pointerEvents: 'none',
            animationName: 'fall',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            boxShadow: `0 0 ${size * 2}px white`,
          }}
        />
      );
    }

    setStars(generatedStars);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'visible',
        }}
      >
        {stars}
      </div>
    </>
  );
}
