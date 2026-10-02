import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export { http } from './http';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function metaBuilder(value: string) {
  return [{ title: `${value} | WinVu` }];
}

export function convertType(value: string) {
  const maps: { [index: string]: unknown } = { NaN, null: null, undefined, Infinity, '-Infinity': -Infinity };

  return value in maps ? maps[value] : value;
}

export function countryCodeToEmoji(countryCode: string) {
  // @ts-ignore
  return countryCode.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - The minimum value (default: 0)
 * @param max - The maximum value (default: 100)
 * @returns A random integer between min and max
 */
export function randomInt(min = 0, max = 100): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
