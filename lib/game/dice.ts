export function getGameResultFromDiceValues(diceValues: number[]) {
  const values = diceValues
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 6)
    .sort((a, b) => a - b);

  if (values.length !== 3) return 0;

  const key = values.join("");
  if (key === "123") return -100;
  if (key === "456") return 106;

  const [first, second, third] = values;
  if (first === third) return first === 1 ? 306 : 206;
  if (first === second) return third;
  if (second === third) return first;

  return 0;
}
