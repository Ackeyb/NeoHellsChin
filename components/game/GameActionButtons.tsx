import { labels } from "@/lib/game/labels";
import styles from "@/styles/Game.module.css";

type GameActionButtonsProps = {
  gameOver: boolean;
  onBackToSettings: () => void;
  onPlayAgain: () => void;
};

export default function GameActionButtons({
  gameOver,
  onBackToSettings,
  onPlayAgain,
}: GameActionButtonsProps) {
  return (
    <nav className={styles.gameActions} aria-label="Game actions">
      <button className="secondary-button wide-button" onClick={onBackToSettings} type="button">
        {labels.actions.backToSettings}
      </button>
      <button
        className="secondary-button wide-button"
        disabled={!gameOver}
        onClick={onPlayAgain}
        type="button"
      >
        {labels.actions.playAgain}
      </button>
    </nav>
  );
}
