// clamp number into [0,255]
export const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

export const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
};

export const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");

// generate a color near the given hex
export const getNearbyHex = (hex: string, delta: number = 20) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    clamp(r + (Math.random() * 2 - 1) * delta),
    clamp(g + (Math.random() * 2 - 1) * delta),
    clamp(b + (Math.random() * 2 - 1) * delta)
  );
};