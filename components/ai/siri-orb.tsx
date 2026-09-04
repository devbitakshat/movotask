'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SiriOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isThinking?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SiriOrb({
  size = 'hero',
  isThinking = false,
  className,
  onClick,
}: SiriOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const clickWaveRef = useRef<number>(0);

  // Dimensions based on size preset
  const dimension =
    size === 'sm' ? 36 : size === 'md' ? 96 : size === 'lg' ? 180 : 260;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Retina support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimension * dpr;
    canvas.height = dimension * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;
    let time = 0;

    // Colors matching Apple's vibrant Siri iridescent sphere
    const layers = [
      { r: 236, g: 72, b: 153, speed: 0.015, radiusRatio: 0.42, waveCount: 3, phase: 0 },       // Fuchsia Pink
      { r: 139, g: 92, b: 246, speed: -0.012, radiusRatio: 0.44, waveCount: 4, phase: 1.2 },    // Violet Purple
      { r: 59, g: 130, b: 246, speed: 0.018, radiusRatio: 0.40, waveCount: 3, phase: 2.5 },     // Electric Blue
      { r: 6, g: 182, b: 212, speed: -0.016, radiusRatio: 0.38, waveCount: 5, phase: 3.8 },     // Cyan
      { r: 245, g: 158, b: 11, speed: 0.022, radiusRatio: 0.32, waveCount: 2, phase: 4.9 },     // Solar Amber
    ];

    const centerX = dimension / 2;
    const centerY = dimension / 2;
    const baseRadius = dimension * 0.36;

    const render = () => {
      time += isThinking ? 0.045 : isHovered ? 0.025 : 0.015;

      // Click ripple attenuation
      if (clickWaveRef.current > 0) {
        clickWaveRef.current = Math.max(0, clickWaveRef.current - 0.02);
      }

      ctx.clearRect(0, 0, dimension, dimension);

      // 1. Draw outer ambient atmospheric glow
      const ambientGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.35
      );
      ambientGlow.addColorStop(0, isThinking ? 'rgba(139, 92, 246, 0.35)' : 'rgba(99, 102, 241, 0.22)');
      ambientGlow.addColorStop(0.5, isThinking ? 'rgba(236, 72, 153, 0.25)' : 'rgba(59, 130, 246, 0.15)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw organic fluid wavy layers using lighter/screen composite
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      layers.forEach((layer) => {
        ctx.beginPath();
        const numPoints = 120;
        const currentSpeed = isThinking ? layer.speed * 2.2 : layer.speed;
        const currentPhase = layer.phase + time * currentSpeed;

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;

          // Harmonic wave distortion
          const wave1 = Math.sin(angle * layer.waveCount + currentPhase);
          const wave2 = Math.cos(angle * (layer.waveCount - 1) - currentPhase * 1.3);
          const wave3 = Math.sin(angle * 2 + time * 0.02);

          // Click impulse modulation
          const clickImpulse = Math.sin(angle * 6 + time * 4) * clickWaveRef.current * 12;

          const amplitude = (isThinking ? 14 : isHovered ? 9 : 6) * (dimension / 260);
          const offset = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.15) * amplitude + clickImpulse;

          const r = baseRadius * layer.radiusRatio * 2.2 + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();

        // Layer gradient with rotational offset
        const gradAngle = currentPhase;
        const gx = centerX + Math.cos(gradAngle) * (baseRadius * 0.5);
        const gy = centerY + Math.sin(gradAngle) * (baseRadius * 0.5);

        const radGrad = ctx.createRadialGradient(
          gx,
          gy,
          0,
          centerX,
          centerY,
          baseRadius * 1.05
        );
        const alpha = isThinking ? 0.85 : 0.65;
        radGrad.addColorStop(0, `rgba(${layer.r}, ${layer.g}, ${layer.b}, ${alpha})`);
        radGrad.addColorStop(0.65, `rgba(${layer.r}, ${layer.g}, ${layer.b}, ${alpha * 0.4})`);
        radGrad.addColorStop(1, `rgba(${layer.r}, ${layer.g}, ${layer.b}, 0)`);

        ctx.fillStyle = radGrad;
        ctx.fill();
      });

      // 3. Central bright luminous core
      const coreGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.15,
        centerY - baseRadius * 0.15,
        0,
        centerX,
        centerY,
        baseRadius * 0.65
      );
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGrad.addColorStop(0.3, isThinking ? 'rgba(254, 215, 170, 0.75)' : 'rgba(224, 231, 255, 0.65)');
      coreGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.3)');
      coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // 4. Specular refraction crescent highlight (glassy apple feel)
      const specGrad = ctx.createLinearGradient(
        centerX - baseRadius * 0.6,
        centerY - baseRadius * 0.6,
        centerX + baseRadius * 0.4,
        centerY + baseRadius * 0.4
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.ellipse(
        centerX - baseRadius * 0.12,
        centerY - baseRadius * 0.28,
        baseRadius * 0.52,
        baseRadius * 0.28,
        -Math.PI / 5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimension, isThinking, isHovered]);

  const handleClick = () => {
    clickWaveRef.current = 1.0;
    if (onClick) onClick();
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300',
        isHovered && 'scale-105',
        className
      )}
      style={{ width: dimension, height: dimension }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Background Soft Chromatic Blur Layer */}
      <div
        className={cn(
          'absolute inset-0 rounded-full filter blur-xl opacity-60 dark:opacity-75 transition-all duration-700 pointer-events-none',
          isThinking
            ? 'scale-125 bg-linear-to-tr from-pink-500 via-indigo-500 to-cyan-400 opacity-90'
            : 'bg-linear-to-tr from-indigo-500/50 via-purple-500/50 to-pink-500/50'
        )}
      />

      {/* Main Canvas Sphere */}
      <canvas
        ref={canvasRef}
        className="relative z-10 drop-shadow-2xl"
        style={{
          width: dimension,
          height: dimension,
        }}
      />
    </div>
  );
}
