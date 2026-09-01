import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#05080c] px-5 py-10 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.15),transparent_26rem),linear-gradient(180deg,#071018_0%,#05080c_72%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent"
      />

      <section className="relative flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/brand/geomaster-icon-192.png"
          alt=""
          width={112}
          height={112}
          className="drop-shadow-[0_0_36px_rgba(34,211,238,0.24)]"
          priority
        />
        <p className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-100/68">
          GeoMaster · 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
          This location is outside the atlas. Return to GeoMaster to explore the
          map or start a geography quiz.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-100/30 bg-cyan-300/14 px-6 py-3 text-sm font-semibold text-cyan-50 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.35)] transition hover:border-cyan-100/44 hover:bg-cyan-300/22 focus:outline-none focus:ring-2 focus:ring-cyan-200/80 focus:ring-offset-2 focus:ring-offset-[#05080c]"
        >
          Return to GeoMaster
        </Link>
      </section>
    </main>
  );
}
