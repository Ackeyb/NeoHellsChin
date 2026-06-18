import { rollModeOptions } from "@/lib/game/rollMode";
import type { RollMode } from "@/lib/game/types";
import styles from "@/styles/Home.module.css";

type RollModeSelectorProps = {
  value: RollMode;
  onChange: (mode: RollMode) => void;
};

export default function RollModeSelector({ value, onChange }: RollModeSelectorProps) {
  return (
    <div className={styles.rollModeBox} aria-label="サイコロの振り方">
      <div className={styles.rollModeTitle}>サイコロの振り方</div>
      <div className={styles.rollModeChoices}>
        {rollModeOptions.map((option) => (
          <button
            key={option.mode}
            className={`${styles.rollModeChoice} ${value === option.mode ? styles.rollModeSelected : ""}`}
            onClick={() => onChange(option.mode)}
            type="button"
            aria-pressed={value === option.mode}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
