import { useRef, useEffect, useState } from "react";

interface PartialRevealImageProps {
  src: string;
  revealLevel: number; // 0-100
  className?: string;
  hoverBoost?: boolean;
  seed?: number;
}

/**
 * Frosted-glass / soft-blur reveal.
 * 
 * Stage 1 (0-20%):   Heavy frosted glass — silhouette + colors visible, no detail.
 * Stage 2 (20-40%):  Soft blur — facial outline becomes visible.
 * Stage 3 (40-60%):  Light blur — features recognisable but dreamy.
 * Stage 4 (60-85%):  Very light blur — mostly clear, slight softness.
 * Stage 5 (85-100%): Fully revealed.
 * 
 * Uses CSS filter blur on a layered approach for a warm, natural feel.
 */
export default function PartialRevealImage({
  src,
  revealLevel,
  className = "",
  hoverBoost = false,
}: PartialRevealImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const effective = Math.min(100, revealLevel + (hoverBoost ? 12 : 0));

  // Map reveal level to blur radius (px) — smooth interpolation
  const getBlurRadius = (level: number): number => {
    if (level >= 85) return 0;
    if (level >= 60) return lerp(4, 0, (level - 60) / 25);
    if (level >= 40) return lerp(12, 4, (level - 40) / 20);
    if (level >= 20) return lerp(24, 12, (level - 20) / 20);
    return lerp(40, 24, level / 20);
  };

  // Map reveal level to brightness boost (warm glow at low reveals)
  const getBrightness = (level: number): number => {
    if (level >= 60) return 1;
    if (level >= 20) return lerp(1.08, 1.0, (level - 20) / 40);
    return lerp(1.12, 1.08, level / 20);
  };

  // Map reveal level to saturation (slightly desaturated when hidden)
  const getSaturation = (level: number): number => {
    if (level >= 60) return 1;
    if (level >= 20) return lerp(0.85, 1.0, (level - 20) / 40);
    return lerp(0.7, 0.85, level / 20);
  };

  const blur = getBlurRadius(effective);
  const brightness = getBrightness(effective);
  const saturation = getSaturation(effective);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Base image with blur + color adjustments */}
      <img
        src={src}
        alt=""
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-700 ease-out"
        style={{
          filter: `blur(${blur}px) brightness(${brightness}) saturate(${saturation})`,
          // Scale up slightly when blurred to hide edge artifacts
          transform: blur > 2 ? `scale(${1 + blur * 0.008})` : undefined,
          opacity: loaded ? 1 : 0,
        }}
      />

      {/* Warm frosted overlay — fades out as reveal increases */}
      {effective < 60 && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 35%, 
              hsla(25, 30%, 15%, ${lerp(0.25, 0, effective / 60)}) 0%, 
              hsla(25, 20%, 10%, ${lerp(0.15, 0, effective / 60)}) 100%)`,
          }}
        />
      )}

      {/* Loading placeholder */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
