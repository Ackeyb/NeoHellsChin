import type { RollMode } from "./types";

export const rollModeOptions: Array<{
  mode: RollMode;
  label: string;
  description: string;
  burstChance: number;
}> = [
  { mode: "gentle", label: "丁寧", description: "ふんわり 1%", burstChance: 0.01 },
  { mode: "normal", label: "普通", description: "いつもの 5%", burstChance: 0.05 },
  { mode: "rough", label: "乱暴", description: "つよめ 10%", burstChance: 0.1 },
];

export const defaultRollMode: RollMode = "normal";

export function getRollModeOption(mode: RollMode) {
  return rollModeOptions.find((option) => option.mode === mode) ?? rollModeOptions[1];
}

export function normalizeRollMode(mode: unknown): RollMode {
  return rollModeOptions.some((option) => option.mode === mode)
    ? (mode as RollMode)
    : defaultRollMode;
}

export function shouldBurst(mode: RollMode, random = Math.random) {
  return random() < getRollModeOption(mode).burstChance;
}

export type RectLike = Pick<DOMRect, "left" | "right" | "top" | "bottom">;

export function isOutsideBoundary(target: RectLike, boundary: RectLike, margin = 0) {
  return (
    target.right < boundary.left - margin ||
    target.left > boundary.right + margin ||
    target.bottom < boundary.top - margin ||
    target.top > boundary.bottom + margin
  );
}
