import { labels } from "@/lib/game/labels";
import type { GameMode } from "@/lib/game/types";
import styles from "@/styles/Game.module.css";

type GameHeaderProps = {
  mode: GameMode;
  round: number;
  cups: number;
};

export default function GameHeader({ mode, round, cups }: GameHeaderProps) {
  return (
    <header className={styles.gameHeader}>
      <h1>Round {round}</h1>
      <div className={styles.cupsLine}>
        <span>{mode === "lose" ? labels.statuses.loser : labels.statuses.winner}</span>
        <strong>{cups}</strong>
        <span>{labels.fields.cupsUnit}</span>
        <small>
          {labels.fields.capUnit}
          {cups / 5}
        </small>
      </div>
    </header>
  );
}
