import type { ApplyResultOutcome, GameState, Player, PlayerStatus } from "./types";
import { normalizeRollMode } from "./rollMode.ts";

export function createInitialGameState(setup: {
  players: string[];
  config: { startCups: number; addPerRound: number; cutOff: number };
  mode: GameState["mode"];
  rule123: GameState["rule123"];
  rollMode?: GameState["rollMode"];
}): GameState {
  return {
    players: setup.players.map((name, index) => ({
      id: `${index}-${name}`,
      name,
      result: null,
      displayResult: null,
      canPlay: true,
      status: "battle",
    })),
    mode: setup.mode,
    round: 1,
    cups: setup.config.startCups,
    addPerRound: setup.config.addPerRound,
    cutOff: setup.config.cutOff,
    turn: 0,
    gameOver: false,
    rule123: setup.rule123,
    rollMode: normalizeRollMode(setup.rollMode),
  };
}

export function getActivePlayers(players: Player[]) {
  return players.filter((player) => player.canPlay);
}

export function getCurrentPlayer(state: GameState) {
  return getActivePlayers(state.players)[state.turn] ?? null;
}

export function applyResult(state: GameState, selectedResult: number): ApplyResultOutcome {
  const activePlayers = getActivePlayers(state.players);
  const activePlayer = activePlayers[state.turn];
  if (!activePlayer || state.gameOver) {
    return { state, effects: [], sound: null };
  }

  let nextState: GameState = {
    ...state,
    players: state.players.map((player) => ({ ...player })),
  };
  const effects: ApplyResultOutcome["effects"] = [];
  let sound: ApplyResultOutcome["sound"] = null;
  const player = nextState.players.find((item) => item.id === activePlayer.id);
  if (!player) return { state, effects: [], sound: null };

  player.result = selectedResult - state.cutOff;
  player.displayResult = getDisplayResult(selectedResult);
  player.status = getStatusForResult(selectedResult, state.cutOff);

  if (selectedResult <= -100) {
    effects.push("curse");
    sound = "123";

    if (
      nextState.rule123?.type === "end" &&
      nextState.rule123.endCupLimit !== null &&
      nextState.cups >= nextState.rule123.endCupLimit
    ) {
      return finish(nextState, effects, sound);
    }

    if (nextState.rule123?.type === "revive") {
      effects.push("revive");
      nextState.players = nextState.players.map((item) => ({
        ...item,
        canPlay: true,
        result: 0,
        displayResult: null,
        status: "continue",
      }));
      return {
        state: { ...nextState, turn: 0 },
        effects,
        sound,
      };
    }
  }

  if (selectedResult >= 100) {
    if (selectedResult < 200) {
      sound = "456";
      effects.push("happy");
      nextState.cups *= 2;
    } else if (selectedResult < 300) {
      sound = "triple";
      effects.push("happier");
      nextState.cups *= 3;
    } else {
      sound = "111";
      effects.push("happiest");
      nextState.cups *= 5;
    }
  }

  const refreshedActivePlayers = getActivePlayers(nextState.players);
  const isLastTurn = state.turn >= refreshedActivePlayers.length - 1;
  if (!isLastTurn) {
    return {
      state: { ...nextState, turn: state.turn + 1 },
      effects,
      sound,
    };
  }

  nextState =
    nextState.mode === "lose"
      ? settleLoseModeRound(nextState)
      : settleWinModeRound(nextState);

  if (nextState.gameOver) {
    effects.push("finish");
  } else {
    effects.push("nextRound");
  }

  return { state: nextState, effects, sound };
}

function getStatusForResult(selectedResult: number, cutOff: number): PlayerStatus {
  if (selectedResult >= 100) return "scored";
  return selectedResult > cutOff ? "scored" : "zako";
}

function getDisplayResult(selectedResult: number) {
  if (selectedResult <= -100) return "123";
  if (selectedResult < 100) return String(selectedResult);
  if (selectedResult < 200) return "456";
  if (selectedResult < 300) return "ゾロ目";
  return "ピンゾロ";
}

function settleLoseModeRound(state: GameState): GameState {
  const players = state.players.map((player) => ({ ...player }));
  const roundPlayers = getActivePlayers(players);
  const zeroOrLess = roundPlayers.filter((player) => (player.result ?? 0) <= 0);
  const aboveZero = roundPlayers.filter((player) => (player.result ?? 0) > 0);

  let gameOver = false;

  if (zeroOrLess.length === 1) {
    setStatuses(roundPlayers, zeroOrLess, "loser", "winner");
    gameOver = true;
  } else if (zeroOrLess.length >= 2) {
    setStatuses(roundPlayers, zeroOrLess, "continue", "winner");
  } else {
    const minResult = Math.min(...aboveZero.map((player) => player.result ?? Infinity));
    const lowestScorers = aboveZero.filter((player) => player.result === minResult);
    if (lowestScorers.length === 1) {
      setStatuses(roundPlayers, lowestScorers, "loser", "winner");
      gameOver = true;
    } else {
      setStatuses(roundPlayers, lowestScorers, "continue", "winner");
    }
  }

  const activeCount = getActivePlayers(players).length;
  gameOver = gameOver || activeCount <= 1;

  return {
    ...state,
    players,
    cups: gameOver ? state.cups : state.cups + state.addPerRound,
    round: gameOver ? state.round : state.round + 1,
    turn: 0,
    gameOver,
  };
}

function settleWinModeRound(state: GameState): GameState {
  const players = state.players.map((player) => ({ ...player }));
  const roundPlayers = getActivePlayers(players);
  const aboveZero = roundPlayers.filter((player) => (player.result ?? 0) > 0);
  const maxResult = Math.max(...aboveZero.map((player) => player.result ?? -Infinity));
  const topScorers = aboveZero.filter((player) => player.result === maxResult);
  const nobodyCanWin = topScorers.length === 0 || topScorers.length === roundPlayers.length;

  if (nobodyCanWin) {
    roundPlayers.forEach((player) => {
      player.status = "continue";
      player.canPlay = true;
    });
  } else {
    roundPlayers.forEach((player) => {
      if (topScorers.some((winner) => winner.id === player.id)) {
        player.status = "winner";
        player.canPlay = false;
      } else {
        player.status = "continue";
        player.canPlay = true;
      }
    });
  }

  const activePlayers = getActivePlayers(players);
  const gameOver = activePlayers.length <= 1;
  if (gameOver && activePlayers[0]) {
    activePlayers[0].status = "loser";
    activePlayers[0].canPlay = false;
  }

  return {
    ...state,
    players,
    cups: gameOver ? state.cups : state.cups + state.addPerRound,
    round: gameOver ? state.round : state.round + 1,
    turn: 0,
    gameOver,
  };
}

function setStatuses(
  roundPlayers: Player[],
  targetPlayers: Player[],
  targetStatus: PlayerStatus,
  otherStatus: PlayerStatus,
) {
  roundPlayers.forEach((player) => {
    const isTarget = targetPlayers.some((target) => target.id === player.id);
    player.status = isTarget ? targetStatus : otherStatus;
    player.canPlay = isTarget && targetStatus === "continue";
  });
}

function finish(
  state: GameState,
  effects: ApplyResultOutcome["effects"],
  sound: ApplyResultOutcome["sound"],
): ApplyResultOutcome {
  return {
    state: { ...state, gameOver: true },
    effects: [...effects, "finish"],
    sound,
  };
}
