import { useRef, MouseEvent, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Returns ref and style props that compute rotateX/rotateY (max 5 degrees) 
 * based on cursor position relative to element bounds on mousemove, 
 * springing back to 0/0 on mouse leave.
 */
export const useHoverTilt = (maxTilt: number = 5) => {
  const ref = useRef<any>(null);
  const prefersReducedMotion = useReducedMotion();

  // We use 0.5 as center (range 0 to 1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!ref.current || prefersReducedMotion) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0.5);
    y.set(0.5);
  };

  return {
    ref,
    props: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        rotateX: prefersReducedMotion ? 0 : rotateX,
        rotateY: prefersReducedMotion ? 0 : rotateY,
        transformPerspective: 1000,
      }
    }
  };
};

/**
 * Translates an element up to 4px toward the cursor when within the given radius.
 * Spring-animated back to 0,0 when the cursor leaves.
 * Intended for use ONLY on primary CTA buttons.
 */
export const useMagneticHover = (radius: number = 80) => {
  const ref = useRef<any>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rect: DOMRect | null = null;
    
    const updateRect = () => {
      if (ref.current) rect = ref.current.getBoundingClientRect();
    };

    // Cache the rect on resize and scroll instead of on every mouse move
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    
    // Initial fetch after a tiny delay to ensure layout is settled
    const timeoutId = setTimeout(updateRect, 100);

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        // max pull of 4px
        const maxPull = 4;
        const pullX = (distanceX / radius) * maxPull;
        const pullY = (distanceY / radius) * maxPull;
        x.set(pullX);
        y.set(pullY);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      clearTimeout(timeoutId);
    };
  }, [radius, prefersReducedMotion, x, y]);

  return {
    ref,
    style: {
      x: prefersReducedMotion ? 0 : springX,
      y: prefersReducedMotion ? 0 : springY,
    }
  };
};
