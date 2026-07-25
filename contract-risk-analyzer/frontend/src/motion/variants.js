import { useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * panelReveal - Scroll reveal container & item variants
 * Fades in and slides up 12px, staggered by 0.08s per child
 */
export const panelRevealContainer = (reduced = false) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reduced ? 0 : 0.08,
      delayChildren: 0.04,
    },
  },
});

export const panelRevealItem = (reduced = false) => ({
  hidden: { opacity: 0, y: reduced ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reduced ? 0.2 : 0.4,
      ease: 'easeOut',
    },
  },
});

/**
 * clickPulse - Framer Motion tap scale pulse
 */
export const clickPulse = {
  rest: { scale: 1 },
  tap: { scale: 0.97 },
};

/**
 * Custom hook for 3D cursor tilt-on-hover effect
 * Calculates rotateX and rotateY up to maxTilt degrees based on cursor position.
 * Returns spring-animated values and mouse event handlers.
 * Respects prefers-reduced-motion automatically.
 * 
 * @param {number} [maxTilt=4] - Maximum tilt angle in degrees
 */
export const useHoverTilt = (maxTilt = 4) => {
  const shouldReduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(rawX, { stiffness: 350, damping: 25 });
  const rotateY = useSpring(rawY, { stiffness: 350, damping: 25 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / rect.width) - 0.5;
    const yPct = (mouseY / rect.height) - 0.5;

    rawX.set(-yPct * (maxTilt * 2));
    rawY.set(xPct * (maxTilt * 2));
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return {
    rotateX: shouldReduceMotion ? 0 : rotateX,
    rotateY: shouldReduceMotion ? 0 : rotateY,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: {
      rotateX: shouldReduceMotion ? 0 : rotateX,
      rotateY: shouldReduceMotion ? 0 : rotateY,
      transformStyle: 'preserve-3d',
    },
  };
};
