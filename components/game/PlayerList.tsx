import { labels } from "@/lib/game/labels";
import type { Player } from "@/lib/game/types";
import styles from "@/styles/Game.module.css";

type PlayerListProps = {
  players: Player[];
  currentPlayerId?: string;
};

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <section className={styles.playerList} aria-label={labels.sections.players}>
      {players.map((player) => (
        <div
          className={player.id === currentPlayerId ? `${styles.playerRow} ${styles.active}` : styles.playerRow}
          key={player.id}
        >
          <span className={styles.playerName}>{player.name}</span>
          <span className={`${styles.statusPill} ${styles[player.status] ?? ""}`}>
            {labels.statuses[player.status]}
          </span>
          {player.displayResult !== null && (
            <span className={styles.playerResult}>{player.displayResult}</span>
          )}
        </div>
      ))}
    </section>
  );
}
