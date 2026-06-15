import { labels } from "./labels";
import type { GameConfig } from "./types";

export const PLAYER_NAME_MAX_LENGTH = 6;

export type ConfigInput = {
  startCups: string;
  addPerRound: string;
  cutOff: string;
};

export function validatePlayers(players: string[]) {
  const trimmed = players.map((player) => player.trim());

  if (trimmed.length < 2) throw new Error(labels.messages.invalidPlayerCount);
  if (trimmed.some((player) => player === "")) throw new Error(labels.messages.emptyPlayerName);
  if (trimmed.some((player) => player.length > PLAYER_NAME_MAX_LENGTH)) {
    throw new Error("プレイヤー名は6文字までです");
  }
  if (new Set(trimmed).size !== trimmed.length) throw new Error(labels.messages.duplicatePlayerName);

  return trimmed;
}

export function validateConfig(config: ConfigInput): GameConfig {
  const parsed = {
    startCups: Number(config.startCups),
    addPerRound: Number(config.addPerRound),
    cutOff: Number(config.cutOff),
  };

  if (Object.values(parsed).some((value) => Number.isNaN(value))) {
    throw new Error(labels.messages.invalidNumber);
  }

  if (parsed.startCups <= 0) throw new Error(labels.messages.invalidStartCups);
  if (parsed.addPerRound < 0) throw new Error(labels.messages.invalidAddPerRound);
  if (parsed.cutOff < 0 || parsed.cutOff >= 7) throw new Error(labels.messages.invalidCutOff);

  return parsed;
}
