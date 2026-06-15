export const round2 = (n: number): number => Math.round(n * 100) / 100
export const round3 = (n: number): number => Math.round(n * 1000) / 1000
export const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n))
