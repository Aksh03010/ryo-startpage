import { hexToRgbTriplet } from '../constants';

/** Lift dark custom accents until small accent-colored text remains readable on tinted cards. */
export function readableAccent(hex: string): string {
  const original = hexToRgbTriplet(hex).split(',').map(Number);
  const luminance = (rgb: number[]) =>
    rgb
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const surface = original.map((channel, index) => channel * 0.2 + [18, 20, 25][index] * 0.8);
  for (let lift = 0; lift <= 10; lift++) {
    const rgb = original.map((channel) => Math.round(channel + ((255 - channel) * lift) / 10));
    if ((luminance(rgb) + 0.05) / (luminance(surface) + 0.05) >= 4.5)
      return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }
  return '#ffffff';
}
