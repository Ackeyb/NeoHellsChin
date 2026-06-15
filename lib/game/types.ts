export type GameMode = "lose" | "win";

export type Rule123 =
  | {
      type: "revive";
      endCupLimit: null;
    }
  | {
      type: "end";
      endCupLimit: number;
    };

export type GameConfig = {
  startCups: number;
  addPerRound: number;
  cutOff: number;
};

export type GameSetup = {
  players: string[];
  config: GameConfig;
  rule123: Rule123 | null;
  mode: GameMode;
};

export type PlayerStatus =
  | "battle"
  | "zako"
  | "scored"
  | "winner"
  | "loser"
  | "continue";

export type Player = {
  id: string;
  name: string;
  result: number | null;
  displayResult: string | null;
  canPlay: boolean;
  status: PlayerStatus;
};

export type GameState = {
  players: Player[];
  mode: GameMode;
  round: number;
  cups: number;
  addPerRound: number;
  cutOff: number;
  turn: number;
  gameOver: boolean;
  rule123: Rule123 | null;
};

export type GameEffect =
  | "none"
  | "finish"
  | "nextRound"
  | "revive"
  | "curse"
  | "happy"
  | "happier"
  | "happiest";

export type ApplyResultOutcome = {
  state: GameState;
  effects: GameEffect[];
  sound: "123" | "456" | "triple" | "111" | null;
};
