"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type GlobeConfig = COBEOptions & {
  onRender?: (state: Partial<COBEOptions>) => void;
};

const GLOBE_CONFIG: GlobeConfig = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.28,
  dark: 1,
  diffuse: 0.85,
  mapSamples: 16000,
  mapBrightness: 5,
  baseColor: [0.14, 0.28, 0.46],
  markerColor: [0.2, 0.83, 0.68],
  glowColor: [0.1, 0.58, 0.72],
  markers: [
    { location: [43.6532, -79.3832], size: 0.08 },
    { location: [40.7128, -74.006], size: 0.09 },
    { location: [19.4326, -99.1332], size: 0.07 },
    { location: [-23.5505, -46.6333], size: 0.09 },
    { location: [51.5072, -0.1276], size: 0.08 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [28.6139, 77.209], size: 0.08 },
    { location: [35.6762, 139.6503], size: 0.08 },
    { location: [-33.8688, 151.2093], size: 0.07 },
    { location: [1.3521, 103.8198], size: 0.06 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: GlobeConfig;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const rotationRef = useRef(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;

    if (canvasRef.current) {
      canvasRef.current.style.cursor = value === null ? "grab" : "grabbing";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current === null) {
      return;
    }

    const delta = clientX - pointerInteracting.current;
    pointerInteractionMovement.current = delta;
    rotationRef.current = delta / 200;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const updateSize = () => {
      widthRef.current = canvas.offsetWidth;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const globeConfig: GlobeConfig = { ...config };
    delete globeConfig.onRender;

    const globe = createGlobe(canvas, {
      ...globeConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
    });

    let frameId = 0;

    const render = () => {
      if (pointerInteracting.current === null) {
        phiRef.current += 0.005;
      }

      globe.update({
        phi: phiRef.current + rotationRef.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      });

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    const fadeTimeout = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 100);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(fadeTimeout);
      window.removeEventListener("resize", updateSize);
      globe.destroy();
    };
  }, [config]);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        aria-label="Interactive rotating globe"
        className="size-full cursor-grab opacity-0 transition-opacity duration-700 [contain:layout_paint_size]"
        ref={canvasRef}
        onPointerDown={(event) =>
          updatePointerInteraction(
            event.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(event) => updateMovement(event.clientX)}
        onTouchMove={(event) => {
          const touch = event.touches[0];

          if (touch) {
            updateMovement(touch.clientX);
          }
        }}
      />
    </div>
  );
}
