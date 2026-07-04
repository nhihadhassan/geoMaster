// Shared pieces of the primary quiz call-to-action so the emerald identity and
// the play glyph stay consistent across the HUD, setup panel, resume prompt,
// and landing page.

export const emeraldCtaClass =
  "border border-emerald-100/80 bg-emerald-300 text-slate-950 transition hover:bg-emerald-200";

export const emeraldCtaGlowClass =
  "shadow-[0_0_28px_rgba(52,211,153,0.26),inset_0_1px_0_rgba(255,255,255,0.38)]";

const triangleSizeClasses = {
  sm: "border-y-[4px] border-l-[7px]",
  md: "border-y-[5px] border-l-[8px]",
} as const;

export function PlayTriangle({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`h-0 w-0 border-y-transparent border-l-current ${triangleSizeClasses[size]}`}
      aria-hidden="true"
    />
  );
}
