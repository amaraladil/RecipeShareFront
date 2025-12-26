export const UnitGroups: Record<string, { id: number; label: string }[]> = {
  'Volume Metric': [
    { id: 1, label: 'mL' },
    { id: 2, label: 'L' }
  ],
  'Volume Imperial': [
    { id: 3, label: 'tsp' },
    { id: 4, label: 'Tbsp' },
    { id: 5, label: 'fluid ounce' },
    { id: 6, label: 'cup' },
    { id: 7, label: 'pint' },
    { id: 8, label: 'quart' },
    { id: 9, label: 'gallon' }
  ],
  'Weight Metric': [
    { id: 10, label: 'mg' },
    { id: 11, label: 'g' },
    { id: 12, label: 'kg' }
  ],
  'Weight Imperial': [
    { id: 13, label: 'ounce' },
    { id: 14, label: 'pound' }
  ],
  Pieces: [
    { id: 15, label: 'pcs' },
    { id: 16, label: 'each' },
    { id: 17, label: 'dozen' },
    { id: 18, label: 'bunch' },
    { id: 19, label: 'head' }
  ],
  Other: [
    { id: 21, label: 'pinch' },
    { id: 22, label: 'dash' },
    { id: 23, label: 'clove' },
    { id: 24, label: 'slice' },
    { id: 25, label: 'stick' },
    { id: 26, label: 'package' },
    { id: 27, label: 'can' },
    { id: 28, label: 'bottle' }
  ]
}

// flattened lookup map for fast id -> label resolution
export const UnitsById: Record<number, string> = Object.values(
  UnitGroups
).reduce((acc, group) => {
  group.forEach((u) => {
    acc[u.id] = u.label
  })
  return acc
}, {} as Record<number, string>)
