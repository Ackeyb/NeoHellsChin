import { labels } from "@/lib/game/labels";
import styles from "@/styles/Home.module.css";

type PlayerSectionProps = {
  players: string[];
  onOpenDialog: () => void;
  onRemovePlayer: (index: number) => void;
};

export default function PlayerSection({ players, onOpenDialog, onRemovePlayer }: PlayerSectionProps) {
  return (
    <section className={styles.panel} aria-labelledby="players-heading">
      <div className={styles.sectionHeading} id="players-heading">
        {labels.sections.players}
      </div>
      <button className="primary-button wide-button" onClick={onOpenDialog} type="button">
        {labels.actions.addPlayers}
      </button>
      <div className={styles.playerChipList}>
        {players.length === 0 ? (
          <span className={styles.emptyMessage}>{labels.messages.noPlayers}</span>
        ) : (
          players.map((player, index) => (
            <span className={styles.playerChip} key={`${player}-${index}`}>
              {player}
              <button
                aria-label={`${player} remove`}
                onClick={() => onRemovePlayer(index)}
                type="button"
              >
                x
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  );
}
