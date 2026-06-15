import { labels } from "@/lib/game/labels";
import styles from "@/styles/Game.module.css";

type GameSettingsStripProps = {
  addPerRound: number;
  cutOff: number;
};

export default function GameSettingsStrip({ addPerRound, cutOff }: GameSettingsStripProps) {
  return (
    <section className={styles.settingsStrip} aria-label={labels.sections.gameSettings}>
      <span>
        {labels.fields.addPerRound}: <strong>{addPerRound}</strong>
      </span>
      <span>
        {labels.fields.cutOff}: <strong>{cutOff}</strong> 以下
      </span>
    </section>
  );
}
