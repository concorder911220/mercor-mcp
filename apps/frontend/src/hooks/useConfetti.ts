import confetti from 'canvas-confetti';

const CONFETTI_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#3b82f6', '#ef4444'];

const CONFETTI_CONFIG = {
  BURST_1: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: CONFETTI_COLORS
  },
  BURST_2: {
    particleCount: 50,
    spread: 50,
    origin: { y: 0.7 },
    colors: CONFETTI_COLORS
  },
  DELAY: 200
} as const;

export const useConfetti = () => {
  const triggerConfetti = () => {
    confetti(CONFETTI_CONFIG.BURST_1);
    setTimeout(() => confetti(CONFETTI_CONFIG.BURST_2), CONFETTI_CONFIG.DELAY);
  };

  return { triggerConfetti };
};
