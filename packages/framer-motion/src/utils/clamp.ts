export const clamp = (min: number, max: number, v: number) =>
    Math.min(Math.max(v, min), max)
