"use client";

// GSAP-powered merry-go-round spin wheel for the marketing homepage.
//   - Bottles displayed large so label text is readable (sizes scale down on mobile)
//   - GSAP owns all motion: carousel rotation, halo color, entrance, idle breathing
//   - back.out ease on spin gives a satisfying weighted overshoot
//   - ScrollTrigger entrance animation when the section enters the viewport
//   - Subtle idle breathing on the carousel so the scene feels alive
//   - Swipe left/right on touch devices to spin between juices
//
// Public + no-login (drinks table has a public read RLS policy). Falls back to
// SEED_DRINKS so the section, and the bottle photos, always render.
// Bottle PNGs in public/assets/ look best with their backgrounds removed.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsapClient";
import { createClient } from "@/lib/supabase/client";
import { SEED_DRINKS } from "@/lib/drinks-seed";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Dimensions per breakpoint. Mobile keeps the whole carousel inside a phone
// viewport; desktop is the large heroic layout. Defaulting to mobile means SSR
// and first client render agree (no hydration mismatch); we upgrade after mount.
const DIMS = {
  mobile: {
    perspective: 1100,
    stage: 430,
    carouselW: 180,
    carouselH: 350,
    radius: 155,
    halo: 230,
    glow: 320,
    glowBlur: 45,
    shadow: "drop-shadow(0 10px 16px rgba(0,0,0,0.16))",
    breathe: 6,
  },
  desktop: {
    perspective: 2000,
    stage: 720,
    carouselW: 300,
    carouselH: 620,
    radius: 460,
    halo: 380,
    glow: 520,
    glowBlur: 70,
    shadow: "drop-shadow(0 15px 25px rgba(0,0,0,0.18))",
    breathe: 8,
  },
};

export function HomeSpinWheel() {
  const [drinks, setDrinks] = useState(SEED_DRINKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Refs for direct GSAP manipulation. Rotation lives outside React state because
  // GSAP owns the carousel transform once animation starts.
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const haloRef = useRef(null);
  const glowRef = useRef(null);
  const rotationRef = useRef(0);
  const touchStartRef = useRef(null);

  const dims = isDesktop ? DIMS.desktop : DIMS.mobile;

  // Track the breakpoint so the carousel resizes between phone and desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadDrinks() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("drinks")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });
        if (active && !error && data && data.length > 0) setDrinks(data);
      } catch {
        // keep SEED_DRINKS fallback
      }
    }
    loadDrinks();
    return () => {
      active = false;
    };
  }, []);

  const anglePerItem = useMemo(
    () => (drinks.length > 0 ? 360 / drinks.length : 0),
    [drinks.length]
  );

  // Each bottle's opacity by its angular distance from the front position.
  function getInitialOpacity(bottleIndex) {
    const angle = (((bottleIndex * anglePerItem) % 360) + 360) % 360;
    const distFromFront = Math.min(angle, 360 - angle);
    if (distFromFront < 5) return 1;
    if (distFromFront < 50) return 0.25;
    return 0;
  }

  // Entrance + idle breathing, triggered when the section scrolls into view.
  useGSAP(
    () => {
      if (!sectionRef.current || drinks.length === 0) return;

      // GSAP owns the carousel transform from here on.
      gsap.set(carouselRef.current, { rotationY: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });

      tl.from(".spin-headline", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
      })
        .from(
          ".bottles-stage",
          { scale: 0.85, opacity: 0, duration: 1.1, ease: "back.out(1.3)" },
          "-=0.5"
        )
        .from(
          ".spin-controls, .spin-details",
          { y: 20, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" },
          "-=0.6"
        );

      // Gentle continuous float so the static scene feels alive.
      gsap.to(carouselRef.current, {
        y: -dims.breathe,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: sectionRef, dependencies: [drinks.length] }
  );

  const { contextSafe } = useGSAP({ scope: carouselRef });

  // Spin by `direction` steps (+1 = next juice, -1 = previous). Wrapped in
  // contextSafe so GSAP tweens are scoped and cleaned up with the component.
  const spin = contextSafe((direction = 1) => {
    if (drinks.length === 0) return;

    const newIndex =
      (currentIndex + direction + drinks.length) % drinks.length;
    rotationRef.current -= direction * anglePerItem;

    // Update React state immediately so side-bottle opacities and the details below transition in sync.
    setCurrentIndex(newIndex);

    // Rotate the carousel with a satisfying overshoot.
    gsap.to(carouselRef.current, {
      rotationY: rotationRef.current,
      duration: 1.1,
      ease: "back.out(1.2)",
    });

    // Halo + glow smoothly transition to the new juice's color.
    gsap.to([haloRef.current, glowRef.current], {
      backgroundColor: drinks[newIndex].color_hex,
      duration: 0.8,
      ease: "power2.out",
    });

    // Quick punch on the halo to emphasize the change.
    gsap.fromTo(
      haloRef.current,
      { scale: 1 },
      { scale: 1.08, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 }
    );
  });

  // Touch swipe: horizontal drag spins; vertical drags fall through to scroll.
  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchEnd(e) {
    const start = touchStartRef.current;
    if (!start) return;
    touchStartRef.current = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    // Only act on a clearly horizontal swipe past a small threshold.
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      spin(dx < 0 ? 1 : -1); // swipe left -> next, swipe right -> previous
    }
  }

  const drink = drinks[currentIndex];
  if (!drink) return null;

  return (
    <section ref={sectionRef} className="overflow-hidden bg-ivory">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {/* Section header */}
        <div className="spin-headline mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">Spin to try</p>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Browse the menu, <span className="italic text-primary">one spin at a time</span>
          </h2>
        </div>

        {/* The 3D carousel stage */}
        <div
          className="bottles-stage relative flex touch-pan-y select-none items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            perspective: `${dims.perspective}px`,
            perspectiveOrigin: "center 45%",
            height: `${dims.stage}px`,
          }}
        >
          {/* Halo behind the front bottle */}
          <div
            ref={haloRef}
            className="absolute rounded-full"
            style={{
              backgroundColor: drink.color_hex,
              width: `${dims.halo}px`,
              height: `${dims.halo}px`,
              opacity: 0.35,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Soft outer glow */}
          <div
            ref={glowRef}
            className="absolute rounded-full"
            style={{
              backgroundColor: drink.color_hex,
              width: `${dims.glow}px`,
              height: `${dims.glow}px`,
              opacity: 0.15,
              filter: `blur(${dims.glowBlur}px)`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* The rotating carousel container */}
          <div
            ref={carouselRef}
            className="relative"
            style={{
              width: `${dims.carouselW}px`,
              height: `${dims.carouselH}px`,
              transformStyle: "preserve-3d",
            }}
          >
            {drinks.map((d, i) => {
              const isCurrent = i === currentIndex;
              return (
                <div
                  key={d.id ?? i}
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                  style={{
                    transform: `rotateY(${i * anglePerItem}deg) translateZ(${dims.radius}px)`,
                    backfaceVisibility: "hidden",
                    opacity: isCurrent ? 1 : getInitialOpacity(i),
                  }}
                >
                  {d.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.image_url}
                      alt={d.name}
                      draggable={false}
                      className="h-full w-auto object-contain"
                      style={{ filter: dims.shadow }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-2xl"
                      style={{
                        width: `${Math.round(dims.carouselW * 0.62)}px`,
                        height: `${Math.round(dims.carouselH * 0.82)}px`,
                        backgroundColor: d.color_hex,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Spin button */}
        <div className="spin-controls mb-6 mt-2 flex flex-col items-center">
          <button
            onClick={() => spin(1)}
            aria-label="Spin to next juice"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-[var(--brand-forest-hover)] active:scale-95"
          >
            <RotateCw className="h-7 w-7" />
          </button>
          <span className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            Spin <span className="md:hidden">or swipe</span>
          </span>
        </div>

        {/* Drink details that update with the selected juice */}
        <div className="spin-details mx-auto max-w-md text-center">
          {drink.tag ? <p className="eyebrow mb-3">{drink.tag}</p> : null}
          <h3 className="font-display text-3xl">{drink.name}</h3>
          {drink.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{drink.description}</p>
          ) : null}
          <p className="mt-4 text-lg font-medium">
            {formatPrice(drink.price_cents)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              or {drink.credit_cost} {drink.credit_cost === 1 ? "credit" : "credits"}
            </span>
          </p>
        </div>

        {/* Progress dots */}
        <div className="mt-10 flex justify-center gap-2">
          {drinks.map((d, i) => (
            <span
              key={d.id ?? i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/pricing">Subscribe to keep spinning</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
