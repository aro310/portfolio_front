import { useEffect, useRef } from "react";

/**
 * Adds class 'visible' to the returned ref element when it enters the viewport.
 * Use with CSS: .reveal { opacity:0; transform:translateY(40px); transition:... }
 *               .reveal.visible { opacity:1; transform:none; }
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el); // fire once
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
