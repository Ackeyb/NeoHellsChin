import assert from "node:assert/strict";
import test from "node:test";
import { getGameResultFromDiceValues } from "../lib/game/dice.ts";
import { applyResult, createInitialGameState } from "../lib/game/engine.ts";
import { cutOffWeights, diceCountWeights, pickWeightedValue } from "../lib/game/randomSettings.ts";
import { isOutsideBoundary, shouldBurst } from "../lib/game/rollMode.ts";
import type { GameState, Rule123 } from "../lib/game/types.ts";

const baseConfig = {
  startCups: 3,
  addPerRound: 1,
  cutOff: 2,
};

function createState(options: {
  mode?: GameState["mode"];
  players?: string[];
  rule123?: Rule123 | null;
} = {}) {
  return createInitialGameState({
    players: options.players ?? ["Alice", "Bob"],
    config: baseConfig,
    mode: options.mode ?? "lose",
    rule123: options.rule123 ?? null,
  });
}

function playMany(state: GameState, results: number[]) {
  return results.reduce((current, result) => applyResult(current, result).state, state);
}

function statusesByName(state: GameState) {
  return Object.fromEntries(state.players.map((player) => [player.name, player.status]));
}

test("creates an initial game state from setup", () => {
  const state = createState({ players: ["Alice", "Bob", "Carol"], mode: "win" });

  assert.equal(state.mode, "win");
  assert.equal(state.rollMode, "normal");
  assert.equal(state.round, 1);
  assert.equal(state.cups, 3);
  assert.equal(state.turn, 0);
  assert.deepEqual(
    state.players.map((player) => ({
      name: player.name,
      result: player.result,
      displayResult: player.displayResult,
      canPlay: player.canPlay,
      status: player.status,
    })),
    [
      { name: "Alice", result: null, displayResult: null, canPlay: true, status: "battle" },
      { name: "Bob", result: null, displayResult: null, canPlay: true, status: "battle" },
      { name: "Carol", result: null, displayResult: null, canPlay: true, status: "battle" },
    ],
  );
});

test("advances to the next player while a round is still running", () => {
  const outcome = applyResult(createState(), 3);

  assert.equal(outcome.state.turn, 1);
  assert.equal(outcome.state.players[0].result, 1);
  assert.equal(outcome.state.players[0].displayResult, "3");
  assert.equal(outcome.state.players[0].status, "scored");
  assert.equal(outcome.state.gameOver, false);
  assert.deepEqual(outcome.effects, []);
});

test("settles lose mode when one player has the lowest result", () => {
  const state = playMany(createState(), [3, 4]);

  assert.equal(state.gameOver, true);
  assert.deepEqual(statusesByName(state), {
    Alice: "loser",
    Bob: "winner",
  });
});

test("continues lose mode on a tie and increases cups", () => {
  const state = playMany(createState({ players: ["Alice", "Bob", "Carol"] }), [4, 4, 4]);

  assert.equal(state.gameOver, false);
  assert.equal(state.round, 2);
  assert.equal(state.cups, 4);
  assert.deepEqual(statusesByName(state), {
    Alice: "continue",
    Bob: "continue",
    Carol: "continue",
  });
});

test("settles win mode by removing the highest scorer", () => {
  const state = playMany(createState({ mode: "win", players: ["Alice", "Bob", "Carol"] }), [6, 3, 4]);

  assert.equal(state.gameOver, false);
  assert.equal(state.round, 2);
  assert.equal(state.cups, 4);
  assert.deepEqual(statusesByName(state), {
    Alice: "winner",
    Bob: "continue",
    Carol: "continue",
  });
});

test("applies special result cup multipliers and effects", () => {
  const state = createState();

  const result456 = applyResult(state, 106);
  assert.equal(result456.state.cups, 6);
  assert.equal(result456.sound, "456");
  assert.deepEqual(result456.effects, ["happy"]);

  const resultTriple = applyResult(state, 206);
  assert.equal(resultTriple.state.cups, 9);
  assert.equal(resultTriple.sound, "triple");
  assert.deepEqual(resultTriple.effects, ["happier"]);

  const result111 = applyResult(state, 306);
  assert.equal(result111.state.cups, 15);
  assert.equal(result111.sound, "111");
  assert.deepEqual(result111.effects, ["happiest"]);
});

test("revives everyone when 123 revive rule is active", () => {
  const state = createState({ rule123: { type: "revive", endCupLimit: null } });
  state.players[1].canPlay = false;
  state.players[1].status = "winner";

  const outcome = applyResult(state, -100);

  assert.equal(outcome.sound, "123");
  assert.deepEqual(outcome.effects, ["curse", "revive"]);
  assert.equal(outcome.state.turn, 0);
  assert.deepEqual(
    outcome.state.players.map((player) => ({
      canPlay: player.canPlay,
      result: player.result,
      displayResult: player.displayResult,
      status: player.status,
    })),
    [
      { canPlay: true, result: 0, displayResult: null, status: "continue" },
      { canPlay: true, result: 0, displayResult: null, status: "continue" },
    ],
  );
});

test("marks results at or below cutoff as zako", () => {
  const outcome = applyResult(createState(), 2);

  assert.equal(outcome.state.players[0].result, 0);
  assert.equal(outcome.state.players[0].displayResult, "2");
  assert.equal(outcome.state.players[0].status, "zako");
});

test("shows special result labels while keeping internal scores", () => {
  const outcome = applyResult(createState(), 206);

  assert.equal(outcome.state.players[0].result, 204);
  assert.equal(outcome.state.players[0].displayResult, "ゾロ目");
  assert.equal(outcome.state.players[0].status, "scored");
});

test("finishes immediately when 123 end rule reaches cup limit", () => {
  const outcome = applyResult(
    createState({ rule123: { type: "end", endCupLimit: 3 } }),
    -100,
  );

  assert.equal(outcome.state.gameOver, true);
  assert.equal(outcome.sound, "123");
  assert.deepEqual(outcome.effects, ["curse", "finish"]);
});

test("converts rolled dice values to game results", () => {
  assert.equal(getGameResultFromDiceValues([1, 2, 3]), -100);
  assert.equal(getGameResultFromDiceValues([6, 5, 4]), 106);
  assert.equal(getGameResultFromDiceValues([1, 1, 1]), 306);
  assert.equal(getGameResultFromDiceValues([5, 5, 5]), 206);
  assert.equal(getGameResultFromDiceValues([2, 2, 6]), 6);
  assert.equal(getGameResultFromDiceValues([1, 4, 6]), 0);
});

test("picks weighted random setting values from configured ranges", () => {
  assert.equal(pickWeightedValue(diceCountWeights, () => 0), 1);
  assert.equal(pickWeightedValue(diceCountWeights, () => 0.3), 2);
  assert.equal(pickWeightedValue(diceCountWeights, () => 0.69), 3);
  assert.equal(pickWeightedValue(diceCountWeights, () => 0.995), 4);

  assert.equal(pickWeightedValue(cutOffWeights, () => 0), 1);
  assert.equal(pickWeightedValue(cutOffWeights, () => 0.03), 2);
  assert.equal(pickWeightedValue(cutOffWeights, () => 0.15), 4);
  assert.equal(pickWeightedValue(cutOffWeights, () => 0.62), 6);
});

test("checks burst roll probabilities by mode", () => {
  assert.equal(shouldBurst("gentle", () => 0.009), true);
  assert.equal(shouldBurst("gentle", () => 0.01), false);
  assert.equal(shouldBurst("normal", () => 0.049), true);
  assert.equal(shouldBurst("normal", () => 0.05), false);
  assert.equal(shouldBurst("rough", () => 0.099), true);
  assert.equal(shouldBurst("rough", () => 0.1), false);
});

test("detects whether a burst die crossed the play boundary", () => {
  const boundary = { left: 10, right: 110, top: 20, bottom: 120 };

  assert.equal(isOutsideBoundary({ left: 30, right: 60, top: 40, bottom: 80 }, boundary, 4), false);
  assert.equal(isOutsideBoundary({ left: 116, right: 144, top: 40, bottom: 80 }, boundary, 4), true);
  assert.equal(isOutsideBoundary({ left: 80, right: 108, top: -20, bottom: 10 }, boundary, 4), true);
});
