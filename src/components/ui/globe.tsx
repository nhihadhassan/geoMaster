"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type GlobeConfig = COBEOptions & {
  onRender?: (state: Partial<COBEOptions>) => void;
};

export type GlobeCityLabel = {
  id: string;
  name: string;
  location: [number, number];
};

type ProjectedCityLabel = GlobeCityLabel & {
  x: number;
  y: number;
  visible: boolean;
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

const AUTO_ROTATION_STEP = 0.008;

const toGlobeVector = ([latitude, longitude]: [number, number]) => {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180 - Math.PI;
  const radius = Math.cos(lat);

  return [-radius * Math.cos(lng), Math.sin(lat), radius * Math.sin(lng)];
};

const projectCityLabels = ({
  labels,
  maxVisibleLabels,
  phi,
  theta,
  scale,
}: {
  labels: GlobeCityLabel[];
  maxVisibleLabels: number;
  phi: number;
  theta: number;
  scale: number;
}) => {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  let visibleCount = 0;

  return labels
    .map((label) => {
      const [x, y, z] = toGlobeVector(label.location);
      const projectedX = cosPhi * x + sinPhi * z;
      const projectedY =
        sinPhi * sinTheta * x + cosTheta * y - cosPhi * sinTheta * z;
      const depth =
        -sinPhi * cosTheta * x + sinTheta * y + cosPhi * cosTheta * z;

      const labelX = (projectedX * scale + 1) / 2;
      const labelY = (-projectedY * scale + 1) / 2;

      return {
        ...label,
        x: labelX,
        y: labelY,
        depth,
        visible:
          depth > 0.16 &&
          projectedX ** 2 + projectedY ** 2 < 0.58 &&
          labelY < 0.42,
      };
    })
    .sort((first, second) => second.depth - first.depth)
    .map((label) => {
      const visible = label.visible && visibleCount < maxVisibleLabels;

      if (visible) {
        visibleCount += 1;
      }

      return {
        ...label,
        visible,
      };
    });
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
  cityLabels = [],
  maxVisibleLabels = 3,
}: {
  className?: string;
  config?: GlobeConfig;
  cityLabels?: GlobeCityLabel[];
  maxVisibleLabels?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(config.phi ?? 0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const rotationRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const [projectedCityLabels, setProjectedCityLabels] = useState<
    ProjectedCityLabel[]
  >([]);

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

    const render = (timestamp: number) => {
      const previousFrameTime = lastFrameTimeRef.current ?? timestamp;
      const frameScale = Math.min((timestamp - previousFrameTime) / 16.67, 60);
      lastFrameTimeRef.current = timestamp;

      if (pointerInteracting.current === null) {
        phiRef.current += AUTO_ROTATION_STEP * frameScale;
      }

      globe.update({
        phi: phiRef.current + rotationRef.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      });

      if (cityLabels.length > 0 && frameCountRef.current % 3 === 0) {
        setProjectedCityLabels(
          projectCityLabels({
            labels: cityLabels,
            maxVisibleLabels,
            phi: phiRef.current + rotationRef.current,
            theta: globeConfig.theta,
            scale: globeConfig.scale ?? 1,
          }),
        );
      }

      frameCountRef.current += 1;
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
  }, [cityLabels, config, maxVisibleLabels]);

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
      {projectedCityLabels.length > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          {projectedCityLabels.map((city) => (
            <div
              key={city.id}
              data-globe-city-label={city.name}
              data-visible={city.visible}
              className={cn(
                "absolute flex -translate-y-1/2 items-center gap-2 transition-[opacity,transform] duration-500 ease-out",
                city.visible
                  ? "opacity-100"
                  : "translate-y-1 opacity-0",
              )}
              style={{
                left: `${city.x * 100}%`,
                top: `${city.y * 100}%`,
                transform:
                  city.x > 0.58
                    ? "translate(-100%, -50%)"
                    : "translate(0, -50%)",
              }}
            >
              {city.x > 0.58 ? (
                <>
                  <span className="rounded-full border border-cyan-100/18 bg-[#071018]/86 px-2.5 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.18em] text-cyan-50 shadow-[0_10px_22px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(186,230,253,0.14)] backdrop-blur-md">
                    {city.name}
                  </span>
                  <span className="h-px w-7 bg-cyan-100/42" />
                  <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.72)]" />
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.72)]" />
                  <span className="h-px w-7 bg-cyan-100/42" />
                  <span className="rounded-full border border-cyan-100/18 bg-[#071018]/86 px-2.5 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.18em] text-cyan-50 shadow-[0_10px_22px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(186,230,253,0.14)] backdrop-blur-md">
                    {city.name}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
