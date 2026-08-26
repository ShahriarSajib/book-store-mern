/**
 * hooks/useReveal.js
 * Lightweight IntersectionObserver hook that flips a `.lp-reveal` element to
 * `.lp-reveal.is-visible` once it enters the viewport.
 * Respects prefers-reduced-motion via the CSS side.
 */
import { useEffect, useRef } from "react";

export default function useReveal({ threshold = 0.12, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return ref;
}
