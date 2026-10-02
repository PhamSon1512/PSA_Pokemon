export function useTranslate() {
  function __(format: string, ...args: any[]): string {
    return format;
  }

  function _n(singular: string, plural: string, count: number, ...args: any[]): string {
    if (count > 1) return __(plural, args);

    return __(singular, args);
  }

  return { __, _n };
}
