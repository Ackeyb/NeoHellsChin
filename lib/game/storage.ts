import type { GameSetup, Player } from "./types";
import { normalizeRollMode } from "./rollMode.ts";

const GAME_CONFIG_KEY = "gameConfig";
const RESUME_PLAYERS_KEY = "resumePlayers";

export function loadGameSetup(): GameSetup | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(GAME_CONFIG_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GameSetup;
    if (!Array.isArray(parsed.players) || parsed.players.length < 2) return null;
    if (!parsed.config || typeof parsed.config.startCups !== "number") return null;
    return { ...parsed, rollMode: normalizeRollMode(parsed.rollMode) };
  } catch {
    return null;
  }
}

export function saveGameSetup(setup: GameSetup) {
  window.localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(setup));
}

export function loadResumePlayerNames(): string[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(RESUME_PLAYERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Pick<Player, "name">>;
    return parsed.map((player) => player.name).filter(Boolean);
  } catch {
    return [];
  } finally {
    window.localStorage.removeItem(RESUME_PLAYERS_KEY);
  }
}

export function saveResumePlayers(players: Player[]) {
  window.localStorage.setItem(
    RESUME_PLAYERS_KEY,
    JSON.stringify(players.map(({ name }) => ({ name }))),
  );
}
