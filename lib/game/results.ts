import type { ResultChoice } from "./types";

export const resultChoices: ResultChoice[] = [
  { id: "none", value: 0, labelKey: "none" },
  ...([1, 2, 3, 4, 5, 6] as const).map((n) => ({
    id: `dice${n}` as ResultChoice["id"],
    value: n,
    labelKey: `dice${n}` as ResultChoice["labelKey"],
    image: {
      normal: `/images/Dice_${n}.png`,
      selected: `/images/Dice_Selected_${n}.png`,
      alt: `Dice ${n}`,
    },
  })),
  {
    id: "123",
    value: -100,
    labelKey: "special123",
    image: {
      normal: "/images/Hand_123.png",
      selected: "/images/Hand_Selected_123.png",
      alt: "123",
    },
  },
  {
    id: "456",
    value: 106,
    labelKey: "special456",
    image: {
      normal: "/images/Hand_456.png",
      selected: "/images/Hand_Selected_456.png",
      alt: "456",
    },
  },
  {
    id: "triple",
    value: 206,
    labelKey: "specialTriple",
    image: {
      normal: "/images/Hand_nnn.png",
      selected: "/images/Hand_Selected_nnn.png",
      alt: "ゾロ目",
    },
  },
  {
    id: "111",
    value: 306,
    labelKey: "special111",
    image: {
      normal: "/images/Hand_111.png",
      selected: "/images/Hand_Selected_111.png",
      alt: "111",
    },
  },
];

export const diceImagePaths = resultChoices
  .flatMap((choice) => (choice.image ? [choice.image.normal, choice.image.selected] : []))
  .map((path) => path.replace("/images/", ""));
