import { labels } from "@/lib/game/labels";
import styles from "@/styles/Game.module.css";

type GameActionButtonsProps = {
  disabled?: boolean;
  gameOver: boolean;
  onBackToSettings: () => void;
  onPlayAgain: () => void;
};

export default function GameActionButtons({
  disabled = false,
  gameOver,
  onBackToSettings,
  onPlayAgain,
}: GameActionButtonsProps) {
  return (
    <nav className={styles.gameActions} aria-label="Game actions">
      <button className="secondary-button wide-button" disabled={disabled} onClick={onBackToSettings} type="button">
        {labels.actions.backToSettings}
      </button>
      <button
        className="secondary-button wide-button"
        disabled={disabled || !gameOver}
        onClick={onPlayAgain}
        type="button"
      >
        {labels.actions.playAgain}
      </button>
    </nav>
  );
}
