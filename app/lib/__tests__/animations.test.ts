import { describe, expect, it } from 'vitest';
import { bigFadeUp, fadeUp } from '../animations';

// ─── fadeUp ───────────────────────────────────────────────────────────────────

describe('fadeUp', () => {
  it('has initial state with opacity 0 and y 40', () => {
    expect(fadeUp.initial).toEqual({ opacity: 0, y: 40 });
  });

  it('has whileInView state with opacity 1 and y 0', () => {
    expect(fadeUp.whileInView.opacity).toBe(1);
    expect(fadeUp.whileInView.y).toBe(0);
  });

  it('whileInView transition duration is 0.5s', () => {
    expect(fadeUp.whileInView.transition).toEqual({ duration: 0.5 });
  });

  it('viewport fires once only', () => {
    expect(fadeUp.viewport).toEqual({ once: true });
  });
});

// ─── bigFadeUp ────────────────────────────────────────────────────────────────

describe('bigFadeUp', () => {
  it('has initial state with opacity 0 and y 100', () => {
    expect(bigFadeUp.initial).toEqual({ opacity: 0, y: 100 });
  });

  it('has whileInView state with opacity 1 and y 0', () => {
    expect(bigFadeUp.whileInView.opacity).toBe(1);
    expect(bigFadeUp.whileInView.y).toBe(0);
  });

  it('whileInView transition duration is 0.7s (slower than fadeUp)', () => {
    expect(bigFadeUp.whileInView.transition).toEqual({ duration: 0.7 });
  });

  it('viewport fires once only', () => {
    expect(bigFadeUp.viewport).toEqual({ once: true });
  });

  it('bigFadeUp y-offset is larger than fadeUp y-offset', () => {
    // @ts-ignore - accessing number property
    expect(Math.abs(bigFadeUp.initial.y)).toBeGreaterThan(Math.abs(fadeUp.initial.y));
  });

  it('bigFadeUp duration is longer than fadeUp duration', () => {
    expect(bigFadeUp.whileInView.transition.duration).toBeGreaterThan(fadeUp.whileInView.transition.duration);
  });
});
