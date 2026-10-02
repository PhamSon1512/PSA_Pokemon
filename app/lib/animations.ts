export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  viewport: { once: true },
};
export const bigFadeUp = {
  initial: { opacity: 0, y: 100 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  viewport: { once: true },
};
