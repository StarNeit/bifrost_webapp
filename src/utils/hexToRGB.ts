export function hexToRGB(hex: string): { r: number, g: number, b: number } {
  if (hex.length === 7 && hex[0] === '#') {
    return {
      r: Number.parseInt(hex.substr(1, 2), 16),
      g: Number.parseInt(hex.substr(3, 2), 16),
      b: Number.parseInt(hex.substr(5, 2), 16),
    };
  }
  if (hex.length === 4 && hex[0] === '#') {
    return {
      r: Number.parseInt(hex[1].repeat(2), 16),
      g: Number.parseInt(hex[2].repeat(2), 16),
      b: Number.parseInt(hex[3].repeat(2), 16),
    };
  }
  return { r: Number.NaN, g: Number.NaN, b: Number.NaN };
}
