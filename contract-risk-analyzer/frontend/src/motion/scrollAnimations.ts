import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin safely for SSR compatibility
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Applies a subtle scroll reveal to elements matching the selector.
 * 
 * Exact duration/easing values from Phase 1 ui-ux-pro-max motion search:
 * - Duration: 400ms (0.4s)
 * - Easing: 'power1.out'
 */
export const initScrollReveal = (selector: string, options?: any) => {
  if (typeof window === 'undefined') return () => {};

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return () => {};

  const { stagger, scrollTriggerOptions = {}, ...tweenOptions } = options || {};
  const animations: gsap.core.Tween[] = [];

  elements.forEach((el) => {
    const animation = gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4, // Extracted from Phase 1 preset
        ease: 'power1.out', // Extracted from Phase 1 preset
        ...tweenOptions,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          ...scrollTriggerOptions,
        },
      }
    );
    animations.push(animation);
  });

  return () => {
    animations.forEach((anim) => {
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
      anim.kill();
    });
  };
};

/**
 * Applies a background-layer parallax effect.
 */
export const initParallaxLayer = (selector: string, speed: number = 0.3) => {
  if (typeof window === 'undefined') return () => {};

  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) return () => {};

  const animations: gsap.core.Tween[] = [];

  elements.forEach((el) => {
    const animation = gsap.to(el, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    animations.push(animation);
  });

  return () => {
    animations.forEach((anim) => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    });
  };
};
