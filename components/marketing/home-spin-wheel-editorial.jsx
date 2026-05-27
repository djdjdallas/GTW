"use client";

// Editorial slideshow variant of the homepage spin wheel (A/B test variant B).
// One bottle hero'd at a time with a soft color halo that morphs to the active
// juice's accent; all labelling is typeset large in the page chrome, not on the
// photo. Browse via numbered tabs, side arrows, left/right keys, or swipe/drag.
// No autoplay, no 3D — flat 2D PNGs don't survive a 3D treatment.
//
// Falls back to SEED_DRINKS so it renders before Supabase responds (and shows
// the bottle photos even when the live rows lack image_url). Named export so the
// A/B wrapper can pick between this and HomeSpinWheel.

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsapClient";
import { createClient } from "@/lib/supabase/client";
import { SEED_DRINKS } from "@/lib/drinks-seed";
import { formatPrice } from "@/lib/utils";

const SWIPE_THRESHOLD = 50; // px before a drag counts as a swipe

export function HomeSpinWheelEditorial() {
  const [drinks, setDrinks] = useState(SEED_DRINKS);
  const [idx, setIdx] = useState(0);
  const stageRef = useRef(null);
  const bottlesRef = useRef([]);
  const infoRef = useRef(null);
  const haloRef = useRef(null);
  const prevIdxRef = useRef(0);
  const dragRef = useRef({ x: 0, active: false });

  // Load live drinks; keep SEED_DRINKS if the call fails or returns nothing.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("drinks")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
        if (!cancelled && !error && data && data.length > 0) setDrinks(data);
      } catch {
        // keep SEED_DRINKS fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goto = useCallback(
    (target) => {
      if (!drinks.length) return;
      const n = ((target % drinks.length) + drinks.length) % drinks.length;
      prevIdxRef.current = idx;
      setIdx(n);
    },
    [drinks.length, idx]
  );

  const prev = useCallback(() => goto(idx - 1), [idx, goto]);
  const next = useCallback(() => goto(idx + 1), [idx, goto]);

  // GSAP timeline on every juice change. Same easing across bottle, halo, and
  // info text so the motion reads as one move, not three parallel ones.
  useGSAP(
    () => {
      if (!drinks.length) return;
      const tl = gsap.timeline();

      const prevEl = bottlesRef.current[prevIdxRef.current];
      if (prevEl && prevIdxRef.current !== idx) {
        tl.to(prevEl, { y: -24, opacity: 0, duration: 0.42, ease: "power3.out" }, 0);
      }

      const nextEl = bottlesRef.current[idx];
      if (nextEl) {
        gsap.set(nextEl, { y: 28, opacity: 0 });
        tl.to(nextEl, { y: 0, opacity: 1, duration: 0.58, ease: "power3.out" }, 0.06);
      }

      if (haloRef.current && drinks[idx]?.color_hex) {
        tl.to(
          haloRef.current,
          { backgroundColor: drinks[idx].color_hex, scale: 0.82, duration: 0.5, ease: "power2.inOut" },
          0
        ).to(haloRef.current, { scale: 0.78, duration: 0.5, ease: "power2.out" }, 0.5);
      }

      if (infoRef.current) {
        tl.fromTo(
          infoRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
          0.08
        );
      }
    },
    { dependencies: [idx, drinks.length], scope: stageRef }
  );

  // Keyboard: arrows + number keys.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (/^[1-9]$/.test(e.key)) {
        const n = parseInt(e.key, 10) - 1;
        if (n < drinks.length) goto(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, goto, drinks.length]);

  // Touch / mouse drag on the stage.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const start = (e) => {
      dragRef.current.active = true;
      dragRef.current.x = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const end = (e) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = endX - dragRef.current.x;
      if (Math.abs(dx) > SWIPE_THRESHOLD) (dx < 0 ? next : prev)();
    };
    el.addEventListener("mousedown", start);
    el.addEventListener("mouseup", end);
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("mousedown", start);
      el.removeEventListener("mouseup", end);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
    };
  }, [prev, next]);

  if (!drinks.length) {
    // Preserve layout so the page doesn't shift if data is ever empty.
    return <section className="min-h-[720px]" aria-busy="true" />;
  }

  const j = drinks[idx];
  const ingredients = Array.isArray(j.ingredients) ? j.ingredients : [];
  const nameParts = j.name.split(" ");
  const nameHead = nameParts.slice(0, -1).join(" ");
  const nameTail = nameParts[nameParts.length - 1];

  return (
    <section className="relative mx-auto max-w-[1280px] overflow-hidden px-6 pb-24 pt-24 md:px-10">
      {/* Kicker */}
      <header className="mb-14 flex flex-wrap items-baseline justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-[#173404]">
            <span className="h-px w-7 bg-[#173404]" />
            Browse the menu
          </div>
          <h2 className="mt-4 max-w-[16ch] font-display text-[clamp(36px,4.2vw,56px)] leading-[1.05] tracking-[-0.015em] text-[#173404]">
            Eight juices.
            <br />
            <em className="font-normal italic">One at a time.</em>
          </h2>
        </div>
        <div className="font-display text-[15px] italic text-[#5F5E5A]">
          <b className="font-medium not-italic tabular-nums text-[#173404]">
            {String(idx + 1).padStart(2, "0")}
          </b>{" "}
          / {String(drinks.length).padStart(2, "0")}
        </div>
      </header>

      {/* Browser: bottle stage + info column */}
      <div className="grid min-h-[560px] items-center gap-10 md:grid-cols-[1.05fr_1fr] md:gap-16">
        {/* Stage */}
        <div
          ref={stageRef}
          className="relative grid aspect-square w-full cursor-grab touch-pan-y select-none place-items-center active:cursor-grabbing"
          aria-roledescription="carousel"
        >
          {/* Color halo — morphs between juice accents */}
          <div
            ref={haloRef}
            className="absolute inset-0 rounded-full opacity-55 will-change-transform"
            style={{ backgroundColor: j.color_hex, transform: "scale(0.78)", filter: "blur(60px)" }}
            aria-hidden="true"
          />
          {/* Editorial vignette rings */}
          <div className="pointer-events-none absolute inset-[8%] rounded-full border border-[rgba(23,52,4,0.14)]" />
          <div className="pointer-events-none absolute inset-[18%] rounded-full border border-[rgba(23,52,4,0.08)]" />

          {/* All bottles stacked, only the active one is visible */}
          <div className="relative grid h-[92%] w-[76%] place-items-center">
            {drinks.map((d, i) => (
              <div
                key={d.id || d.name}
                ref={(el) => {
                  bottlesRef.current[i] = el;
                }}
                className="pointer-events-none absolute inset-0 grid place-items-center"
                style={{ opacity: i === idx ? 1 : 0 }}
                aria-hidden={i !== idx}
              >
                {d.image_url ? (
                  <Image
                    src={d.image_url}
                    alt={d.name}
                    width={420}
                    height={520}
                    priority={i === 0}
                    className="h-auto w-[78%] object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.08)]"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Info column */}
        <div ref={infoRef} className="relative min-h-[380px]">
          <span
            className="mb-7 inline-block rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#173404]"
            style={{ borderColor: j.color_hex, background: `${j.color_hex}22` }}
          >
            {j.tag}
          </span>
          <h3 className="m-0 font-display text-[clamp(48px,7vw,92px)] leading-[0.95] tracking-[-0.02em] text-[#173404]">
            {nameHead ? nameHead + " " : ""}
            <em className="font-normal italic">{nameTail}</em>
          </h3>
          {j.description ? (
            <p className="mb-8 mt-7 max-w-[40ch] text-pretty text-[17px] leading-[1.55] text-[#2C2C2C]">
              {j.description}
            </p>
          ) : null}
          <div className="flex items-baseline gap-7 border-y border-[rgba(23,52,4,0.14)] py-5">
            <div className="font-display text-[30px] font-medium leading-none tabular-nums text-[#173404]">
              {formatPrice(j.price_cents)}
              <span className="ml-2 font-sans text-[14px] font-normal uppercase tracking-[0.06em] text-[#5F5E5A]">
                · per bottle
              </span>
            </div>
            {ingredients.length ? (
              <div className="text-[13px] leading-[1.5] tracking-[0.04em] text-[#5F5E5A]">
                <b className="font-medium text-[#173404]">Pressed with </b>
                {ingredients.join(" · ")}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Nav: numbered tabs + arrow buttons */}
      <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
        <div className="-mt-px flex flex-1 items-center border-t border-[rgba(23,52,4,0.14)]" role="tablist">
          {drinks.map((d, i) => (
            <button
              key={d.id || d.name}
              role="tab"
              aria-selected={i === idx}
              onClick={() => goto(i)}
              className={`relative -mt-px flex-1 border-t pb-4 pt-[18px] text-center font-display text-[14px] tabular-nums transition-colors ${
                i === idx
                  ? "border-[#173404] text-[#173404]"
                  : "border-transparent text-[#5F5E5A] hover:text-[#173404]"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
              <span
                className={`mt-1 block h-4 text-[13px] italic transition-opacity ${
                  i === idx ? "opacity-100" : "opacity-0"
                }`}
              >
                {d.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label="Previous juice"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(23,52,4,0.14)] text-[#173404] transition-colors hover:border-[#173404] hover:bg-[#173404] hover:text-[#FAF7F0]"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M10 2 L4 8 L10 14" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next juice"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(23,52,4,0.14)] text-[#173404] transition-colors hover:border-[#173404] hover:bg-[#173404] hover:text-[#FAF7F0]"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 2 L12 8 L6 14" />
            </svg>
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-[72px] flex flex-col items-center gap-4 text-center">
        <p className="m-0 font-display text-[18px] italic text-[#5F5E5A]">
          Try any three on your first week.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-3.5 rounded-full bg-[#173404] px-9 py-[18px] text-[14px] font-medium uppercase tracking-[0.16em] text-[#FAF7F0] transition-transform hover:-translate-y-0.5 hover:bg-[#0d2102]"
        >
          Start your subscription
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
