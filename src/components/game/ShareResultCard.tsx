"use client";

import { useCallback, useState } from "react";

type ShareResultCardProps = {
  quizLabel: string;
  modeLabel: string;
  score: number;
  total: number;
  statusLabel: string;
};

const WIDTH = 1200;
const HEIGHT = 630;

// The atlas palette, so a shared card is recognisably GeoMaster.
const INK = "#05080c";
const PANEL = "#0b1622";
const TEXT = "#f8fafc";
const MUTED = "#94a3b8";
const EMERALD = "#34d399";
const CYAN = "#22d3ee";

const drawCard = (
  canvas: HTMLCanvasElement,
  { quizLabel, modeLabel, score, total, statusLabel }: ShareResultCardProps,
) => {
  const context = canvas.getContext("2d");

  if (!context) {
    return false;
  }

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  context.fillStyle = INK;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = context.createRadialGradient(
    WIDTH / 2,
    HEIGHT + 120,
    60,
    WIDTH / 2,
    HEIGHT + 120,
    HEIGHT,
  );

  glow.addColorStop(0, "rgba(34,211,238,0.30)");
  glow.addColorStop(1, "rgba(5,8,12,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.strokeStyle = "rgba(255,255,255,0.12)";
  context.lineWidth = 2;
  context.strokeRect(48, 48, WIDTH - 96, HEIGHT - 96);
  context.fillStyle = "rgba(11,22,34,0.55)";
  context.fillRect(49, 49, WIDTH - 98, HEIGHT - 98);
  context.fillStyle = PANEL;

  context.fillStyle = CYAN;
  context.font = "600 26px Geist, system-ui, sans-serif";
  context.letterSpacing = "6px";
  context.fillText("GEOMASTER", 96, 130);
  context.letterSpacing = "0px";

  context.fillStyle = MUTED;
  context.font = "500 30px Geist, system-ui, sans-serif";
  context.fillText(statusLabel, 96, 200);

  context.fillStyle = TEXT;
  context.font = "600 74px Geist, system-ui, sans-serif";
  context.fillText(quizLabel, 96, 292);

  context.fillStyle = EMERALD;
  context.font = "600 150px Geist, system-ui, sans-serif";
  context.fillText(`${score}/${total}`, 96, 452);

  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100);

  context.fillStyle = MUTED;
  context.font = "500 32px Geist, system-ui, sans-serif";
  context.fillText(`${accuracy}% accuracy · ${modeLabel}`, 96, 512);

  context.fillStyle = "rgba(148,163,184,0.72)";
  context.font = "500 26px Geist, system-ui, sans-serif";
  context.fillText(
    new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    96,
    HEIGHT - 96,
  );

  return true;
};

export function ShareResultCard(props: ShareResultCardProps) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );

  const share = useCallback(async () => {
    setStatus("working");

    try {
      const canvas = document.createElement("canvas");

      if (!drawCard(canvas, props)) {
        setStatus("error");

        return;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      if (!blob) {
        setStatus("error");

        return;
      }

      const fileName = `geomaster-${props.quizLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // Prefer the native share sheet where it can take files (mobile), and
      // fall back to a plain download everywhere else.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "GeoMaster",
          text: `${props.score}/${props.total} on ${props.quizLabel}`,
        });
        setStatus("done");

        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch {
      // A cancelled share sheet lands here too, so this is not an error worth
      // shouting about.
      setStatus("idle");
    }
  }, [props]);

  return (
    <button
      type="button"
      onClick={share}
      disabled={status === "working"}
      className="min-h-11 rounded-full border border-white/12 bg-white/7 px-4 py-2 text-sm font-semibold text-white/66 transition hover:bg-white/12 hover:text-white disabled:opacity-60"
    >
      {status === "done" ? "Saved" : status === "error" ? "Try again" : "Share"}
    </button>
  );
}
