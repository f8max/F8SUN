/**
 * 39 CMYK-derived sRGB swatches approved for SYRE C1.
 * Sorted into tonal groups for the finish picker.
 */
export interface Swatch {
  hex: string
  name: string
  group: string
}

export const SWATCHES: Swatch[] = [
  // Darks — 8
  { hex: '#0D1213', name: 'Chassis Black', group: 'dark' },
  { hex: '#0A0608', name: 'Deep Carbon', group: 'dark' },
  { hex: '#181E20', name: 'Oil Rubbed', group: 'dark' },
  { hex: '#1A1C1F', name: 'Shadow Blue', group: 'dark' },
  { hex: '#15181A', name: 'Graphite Wash', group: 'dark' },
  { hex: '#1C1620', name: 'Aubergine Black', group: 'dark' },
  { hex: '#101419', name: 'Midnight Teal', group: 'dark' },
  { hex: '#1B1412', name: 'Burnt Earth', group: 'dark' },

  // Pinks / Magentas — 5
  { hex: '#FF8FA7', name: 'Sakura Pink', group: 'pink' },
  { hex: '#FF6BB9', name: 'Magenta Burst', group: 'pink' },
  { hex: '#FFB3D0', name: 'Powder Rose', group: 'pink' },
  { hex: '#E85291', name: 'Deep Fuchsia', group: 'pink' },
  { hex: '#FF4799', name: 'Hot Neon', group: 'pink' },

  // Oranges / Corals — 5
  { hex: '#FF8F5D', name: 'Signal Orange', group: 'orange' },
  { hex: '#FF6B3D', name: 'Burnt Coral', group: 'orange' },
  { hex: '#FFA870', name: 'Peach Alloy', group: 'orange' },
  { hex: '#E8663A', name: 'Terracotta Flash', group: 'orange' },
  { hex: '#FF5500', name: 'Tangerine', group: 'orange' },

  // Yellows / Golds — 5
  { hex: '#FFD430', name: 'Gold Leaf', group: 'yellow' },
  { hex: '#F1FF27', name: 'Volt Yellow', group: 'yellow' },
  { hex: '#FFE066', name: 'Pale Sun', group: 'yellow' },
  { hex: '#FFC107', name: 'Amber Signal', group: 'yellow' },
  { hex: '#E5C100', name: 'Brass Tone', group: 'yellow' },

  // Greens / Teals — 6
  { hex: '#66FFE1', name: 'Aqua Flash', group: 'green' },
  { hex: '#00E6A0', name: 'Mint Circuit', group: 'green' },
  { hex: '#33FF9E', name: 'Chroma Green', group: 'green' },
  { hex: '#00CC88', name: 'Racing Teal', group: 'green' },
  { hex: '#80FFCC', name: 'Seafoam', group: 'green' },
  { hex: '#66CCB3', name: 'Lagoon', group: 'green' },

  // Blues — 5
  { hex: '#1C08FF', name: 'Ultramarine', group: 'blue' },
  { hex: '#3355FF', name: 'Cobalt Punch', group: 'blue' },
  { hex: '#0066FF', name: 'Electric Blue', group: 'blue' },
  { hex: '#4444DD', name: 'Deep Indigo', group: 'blue' },
  { hex: '#2288DD', name: 'Sky Alloy', group: 'blue' },

  // Purples / Violets — 5
  { hex: '#C21BFF', name: 'Neon Violet', group: 'purple' },
  { hex: '#9933FF', name: 'Amethyst', group: 'purple' },
  { hex: '#7700DD', name: 'Deep Plum', group: 'purple' },
  { hex: '#AA44FF', name: 'Lilac Surge', group: 'purple' },
  { hex: '#5522CC', name: 'Midnight Violet', group: 'purple' },
]

export const TOTAL_SWATCHES = SWATCHES.length

export function getSwatchByHex(hex: string): Swatch | undefined {
  return SWATCHES.find((s) => s.hex.toUpperCase() === hex.toUpperCase())
}
