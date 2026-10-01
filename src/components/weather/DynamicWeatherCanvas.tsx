import React, { useEffect, useRef } from 'react';

export type DynamicWeatherType =
  | 'sunny'
  | 'rainy'
  | 'thunderstorm'
  | 'cloudy'
  | 'foggy'
  | 'night';

interface DynamicWeatherCanvasProps {
  weatherType: DynamicWeatherType;
  intensity?: number; // 0 to 1
  className?: string;
  isCompact?: boolean;
}

export const DynamicWeatherCanvas: React.FC<DynamicWeatherCanvasProps> = ({
  weatherType,
  intensity = 0.8,
  className = '',
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let isVisible = true;
    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Stop animation when tab is hidden or canvas scrolled out of view
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isVisible = true;
        if (!prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && canvas.parentElement) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            if (entry.isIntersecting && !document.hidden) {
              if (!isVisible) {
                isVisible = true;
                if (!prefersReducedMotion) {
                  animationFrameId = requestAnimationFrame(render);
                }
              }
            } else {
              isVisible = false;
              cancelAnimationFrame(animationFrameId);
            }
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas.parentElement);
    }

    // RAIN PARTICLES
    const rainDropsCount = Math.floor((isCompact ? 45 : 85) * intensity);
    const rainDrops = Array.from({ length: rainDropsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 18 + 12,
      speed: Math.random() * 8 + 10,
      opacity: Math.random() * 0.4 + 0.3,
      thickness: Math.random() * 1.2 + 0.8,
    }));

    // RAIN SPLASHES
    const splashes: { x: number; y: number; radius: number; maxRadius: number; opacity: number }[] = [];

    // STARS FOR NIGHT
    const starCount = isCompact ? 35 : 65;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.7),
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      increasing: Math.random() > 0.5,
    }));

    // SUN RAYS FOR SUNNY
    let sunRayAngle = 0;

    // LIGHTNING FOR THUNDERSTORM
    let lightningOpacity = 0;
    let nextLightningTime = Date.now() + Math.random() * 4000 + 2000;
    let lightningBolt: { x: number; y: number }[] | null = null;

    // CLOUD DRIFT PARTICLES
    const clouds = [
      { x: 0, y: height * 0.15, radius: height * 0.4, speed: 0.18, opacity: 0.15 },
      { x: width * 0.5, y: height * 0.25, radius: height * 0.35, speed: 0.25, opacity: 0.12 },
      { x: width * 0.8, y: height * 0.1, radius: height * 0.5, speed: 0.12, opacity: 0.1 },
    ];

    // MIST FOR FOGGY
    const mistLayers = Array.from({ length: 6 }, (_, i) => ({
      x: (i * width) / 5,
      y: height * 0.5 + Math.random() * (height * 0.4),
      width: width * 0.7,
      height: 40 + Math.random() * 30,
      speed: (Math.random() * 0.3 + 0.1) * (i % 2 === 0 ? 1 : -1),
      opacity: 0.08 + Math.random() * 0.08,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. SUNNY: Sunbeam shimmer & lens flare particles
      if (weatherType === 'sunny') {
        sunRayAngle += 0.003;
        const sunX = width * 0.82;
        const sunY = height * 0.25;

        // Radiant Sun Glow
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.min(width, height) * 0.75);
        sunGrad.addColorStop(0, 'rgba(255, 235, 120, 0.55)');
        sunGrad.addColorStop(0.3, 'rgba(255, 190, 60, 0.25)');
        sunGrad.addColorStop(0.7, 'rgba(255, 150, 40, 0.08)');
        sunGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, Math.min(width, height) * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Sun Core
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(255, 220, 100, 0.8)';
        ctx.shadowBlur = 24;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rotating Sun Rays
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(sunRayAngle);
        for (let i = 0; i < 12; i++) {
          ctx.rotate((Math.PI * 2) / 12);
          const rayGrad = ctx.createLinearGradient(0, 0, 0, width * 0.6);
          rayGrad.addColorStop(0, 'rgba(255, 240, 180, 0.18)');
          rayGrad.addColorStop(1, 'rgba(255, 240, 180, 0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(-15, 30);
          ctx.lineTo(15, 30);
          ctx.lineTo(35, width * 0.6);
          ctx.lineTo(-35, width * 0.6);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. NIGHT: Twinkling starlight & glowing moon
      if (weatherType === 'night') {
        const moonX = width * 0.8;
        const moonY = height * 0.25;

        // Moon Glow
        const moonGrad = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 90);
        moonGrad.addColorStop(0, 'rgba(220, 235, 255, 0.4)');
        moonGrad.addColorStop(0.5, 'rgba(180, 210, 255, 0.15)');
        moonGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
        ctx.fill();

        // Crescent Moon Body
        ctx.save();
        ctx.beginPath();
        ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 252, 255, 0.95)';
        ctx.shadowColor = 'rgba(200, 225, 255, 0.7)';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Crescent cutout for realistic moon phase
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(moonX - 9, moonY - 5, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        // Twinkling stars
        stars.forEach((star) => {
          if (star.increasing) {
            star.alpha += star.twinkleSpeed;
            if (star.alpha >= 0.95) star.increasing = false;
          } else {
            star.alpha -= star.twinkleSpeed;
            if (star.alpha <= 0.15) star.increasing = true;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. CLOUDY: Drifting cumulus cloud silhouettes
      if (weatherType === 'cloudy' || weatherType === 'rainy' || weatherType === 'thunderstorm') {
        clouds.forEach((cloud) => {
          cloud.x += cloud.speed;
          if (cloud.x - cloud.radius > width) {
            cloud.x = -cloud.radius;
          }
          const cloudGrad = ctx.createRadialGradient(cloud.x, cloud.y, cloud.radius * 0.2, cloud.x, cloud.y, cloud.radius);
          cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity * 1.5})`);
          cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. RAIN / THUNDERSTORM: Falling rain streaks and surface splashes
      if (weatherType === 'rainy' || weatherType === 'thunderstorm') {
        ctx.strokeStyle = weatherType === 'thunderstorm' ? 'rgba(210, 235, 255, 0.75)' : 'rgba(190, 225, 255, 0.65)';
        ctx.lineCap = 'round';

        rainDrops.forEach((drop) => {
          ctx.lineWidth = drop.thickness;
          ctx.beginPath();
          // Slanted rain (wind angle)
          const angleOffset = drop.length * 0.35;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - angleOffset, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= drop.speed * 0.25;

          // Hit bottom edge: spawn splash
          if (drop.y > height - 10) {
            if (Math.random() > 0.6) {
              splashes.push({
                x: drop.x,
                y: height - 6 - Math.random() * 8,
                radius: 1,
                maxRadius: Math.random() * 5 + 3,
                opacity: 0.6,
              });
            }
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 50);
          }
        });

        // Render Splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.radius += 0.4;
          s.opacity -= 0.04;
          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(210, 235, 255, ${s.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 1.5, s.radius * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 5. THUNDERSTORM: Dramatic lightning flash and branching bolt
      if (weatherType === 'thunderstorm') {
        const now = Date.now();
        if (now > nextLightningTime) {
          lightningOpacity = 0.85;
          nextLightningTime = now + Math.random() * 5000 + 3000;

          // Generate branching lightning bolt
          let startX = width * (0.2 + Math.random() * 0.6);
          let currX = startX;
          let currY = 0;
          lightningBolt = [{ x: currX, y: currY }];
          while (currY < height * 0.75) {
            currY += Math.random() * 25 + 15;
            currX += (Math.random() - 0.5) * 45;
            lightningBolt.push({ x: currX, y: currY });
          }
        }

        if (lightningOpacity > 0.02) {
          // Full-screen sky flash
          ctx.fillStyle = `rgba(230, 240, 255, ${lightningOpacity * 0.35})`;
          ctx.fillRect(0, 0, width, height);

          // Draw lightning bolt
          if (lightningBolt && lightningBolt.length > 1) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${lightningOpacity})`;
            ctx.shadowColor = 'rgba(180, 220, 255, 0.9)';
            ctx.shadowBlur = 18;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(lightningBolt[0].x, lightningBolt[0].y);
            for (let i = 1; i < lightningBolt.length; i++) {
              ctx.lineTo(lightningBolt[i].x, lightningBolt[i].y);
            }
            ctx.stroke();
            ctx.restore();
          }

          lightningOpacity *= 0.88; // fast decay
        }
      }

      // 6. FOGGY: Horizontal rolling mist bands
      if (weatherType === 'foggy') {
        mistLayers.forEach((mist) => {
          mist.x += mist.speed;
          if (mist.x > width + 50) mist.x = -mist.width;
          if (mist.x < -mist.width - 50) mist.x = width;

          const mistGrad = ctx.createLinearGradient(mist.x, 0, mist.x + mist.width, 0);
          mistGrad.addColorStop(0, 'rgba(230, 240, 250, 0)');
          mistGrad.addColorStop(0.5, `rgba(230, 240, 250, ${mist.opacity})`);
          mistGrad.addColorStop(1, 'rgba(230, 240, 250, 0)');

          ctx.fillStyle = mistGrad;
          ctx.fillRect(mist.x, mist.y, mist.width, mist.height);
        });
      }

      if (isVisible && !prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [weatherType, intensity, isCompact]);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-3xl ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
