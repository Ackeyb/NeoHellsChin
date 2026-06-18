type WeightedValue<T extends number> = {
  value: T;
  weight: number;
};

export const diceCountWeights: Array<WeightedValue<1 | 2 | 3 | 4>> = [
  { value: 1, weight: 30 },
  { value: 2, weight: 39 },
  { value: 3, weight: 30 },
  { value: 4, weight: 1 },
];

export const cutOffWeights: Array<WeightedValue<1 | 2 | 3 | 4 | 5 | 6>> = [
  { value: 1, weight: 3 },
  { value: 2, weight: 5 },
  { value: 3, weight: 7 },
  { value: 4, weight: 20 },
  { value: 5, weight: 27 },
  { value: 6, weight: 38 },
];

export function pickWeightedValue<T extends number>(items: Array<WeightedValue<T>>, random = Math.random) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * totalWeight;

  for (const item of items) {
    cursor -= item.weight;
    if (cursor < 0) return item.value;
  }

  return items[items.length - 1].value;
}

export function sumDiceRolls(rolls: Array<{ value?: number | string }>) {
  return rolls.reduce((sum, roll) => {
    const value = Number(roll.value);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}
