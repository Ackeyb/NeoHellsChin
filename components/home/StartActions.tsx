import { labels } from "@/lib/game/labels";
import type { GameMode } from "@/lib/game/types";
import styles from "@/styles/Home.module.css";

type StartActionsProps = {
  onStart: (mode: GameMode) => void;
};

export default function StartActions({ onStart }: StartActionsProps) {
  return (
    <div className={styles.startActions}>
      <button className={`${styles.startButton} ${styles.lose}`} onClick={() => onStart("lose")} type="button">
        {labels.actions.startLoseMode}
      </button>
      <button className={`${styles.startButton} ${styles.win}`} onClick={() => onStart("win")} type="button">
        {labels.actions.startWinMode}
      </button>
    </div>
  );
}
