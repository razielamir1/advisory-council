import { useEffect, useRef } from 'react';

/**
 * Intersection Observer hook — adds 'revealed' class to children
 * with [data-reveal] attribute when they scroll into view.
 * Stagger delay: each child gets i * staggerMs delay.
 */
export function useScrollReveal(staggerMs = 80) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = parseInt(el.dataset.reveal || '0', 10);
            setTimeout(() => {
              el.classList.add('revealed');
            }, index * staggerMs);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [staggerMs]);

  return containerRef;
}
