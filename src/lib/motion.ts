/**
 * Motion engine — Lenis smooth scroll + GSAP ScrollTrigger.
 *
 * This is the single, attribute-driven animation layer for the site. Components
 * stay declarative: they only add data-attributes, no per-component motion JS.
 *
 *   data-reveal              → fade + rise into view on enter
 *   data-reveal="fade"       → fade only (no translate)
 *   data-reveal-stagger      → container whose direct children stagger in
 *   data-parallax="0.4"      → drift on scroll (value = strength)
 *   data-manifesto           → pinned, scrubbed word-by-word statement
 *
 * Fail-safe by design: the `.motion` class is added to <html> before paint by
 * a tiny inline script in BaseLayout, and ONLY when motion is allowed. The
 * CSS reveal base states (opacity:0) are gated on that class, so with JS off
 * or `prefers-reduced-motion`, everything renders visible. If anything below
 * throws, we strip `.motion` to guarantee content is shown.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

function reveal() {
  // Single-element reveals, batched so they share one observer and stagger
  // nicely when several enter together.
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: (els) =>
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        overwrite: true,
      }),
  });

  // Container-level staggered reveals (cards, lists, step grids…).
  gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((box) => {
    ScrollTrigger.create({
      trigger: box,
      start: "top 86%",
      once: true,
      onEnter: () =>
        gsap.to(Array.from(box.children), {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });
  });
}

function parallax() {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const strength = parseFloat(el.dataset.parallax || "0.3");
    const amp = strength * 120;
    gsap.fromTo(
      el,
      { y: amp },
      {
        y: -amp,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

function manifesto() {
  const block = document.querySelector<HTMLElement>("[data-manifesto]");
  if (!block) return;
  const words = block.querySelectorAll<HTMLElement>(".m-word");
  if (!words.length) return;

  gsap.to(words, {
    opacity: 1,
    ease: "none",
    stagger: 0.4,
    scrollTrigger: {
      trigger: block,
      start: "top top",
      end: "+=130%",
      pin: true,
      scrub: 0.6,
    },
  });
}

function anchorScroll(lenis: Lenis) {
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    const url = new URL(a.href, location.href);
    // Only intercept in-page anchors on the current document.
    if (url.pathname !== location.pathname || !url.hash) return;
    a.addEventListener("click", (e) => {
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -88 });
      history.pushState(null, "", url.hash);
    });
  });
}

export function initMotion() {
  // Absent class ⇒ reduced-motion or JS-gated off ⇒ leave everything visible.
  if (!document.documentElement.classList.contains("motion")) return;

  try {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    });
    // Expose for any component that wants programmatic scrolling.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    reveal();
    parallax();
    manifesto();
    anchorScroll(lenis);

    // Re-measure once fonts/images settle.
    ScrollTrigger.refresh();
    window.addEventListener("load", () => ScrollTrigger.refresh());
  } catch (err) {
    // Any failure: reveal all content and fall back to native scrolling.
    document.documentElement.classList.remove("motion");
    console.error("[motion] disabled:", err);
  }
}
