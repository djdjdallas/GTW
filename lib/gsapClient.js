"use client";

// Centralized GSAP setup so plugins are registered exactly once across the app.
// Import gsap, useGSAP, and ScrollTrigger from here instead of from the packages.

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once. React strict mode double-renders, so this guard is intentional.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, useGSAP, ScrollTrigger };
