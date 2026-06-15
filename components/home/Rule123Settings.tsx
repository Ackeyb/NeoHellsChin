import { labels } from "@/lib/game/labels";
import type { Rule123 } from "@/lib/game/types";
import styles from "@/styles/Home.module.css";

type Rule123SettingsProps = {
  useRule123: boolean;
  rule123Type: Rule123["type"];
  endCupLimit: string;
  onUseRule123Change: (enabled: boolean) => void;
  onRule123TypeChange: (type: Rule123["type"]) => void;
  onEndCupLimitChange: (value: string) => void;
};

export default function Rule123Settings({
  useRule123,
  rule123Type,
  endCupLimit,
  onUseRule123Change,
  onRule123TypeChange,
  onEndCupLimitChange,
}: Rule123SettingsProps) {
  return (
    <div className={styles.ruleBox}>
      <div className={styles.smallHeading}>{labels.sections.rule123}</div>
      <label className={styles.checkRow}>
        <input
          checked={useRule123}
          onChange={(event) => onUseRule123Change(event.target.checked)}
          type="checkbox"
        />
        <span>{labels.rule123Options.enable}</span>
      </label>

      <div className={styles.ruleChoices}>
        <label className={useRule123 ? styles.radioRow : `${styles.radioRow} ${styles.disabled}`}>
          <input
            checked={rule123Type === "revive"}
            disabled={!useRule123}
            name="rule123"
            onChange={() => onRule123TypeChange("revive")}
            type="radio"
          />
          <span>{labels.rule123Options.revive}</span>
        </label>

        <label className={useRule123 ? styles.radioRow : `${styles.radioRow} ${styles.disabled}`}>
          <input
            checked={rule123Type === "end"}
            disabled={!useRule123}
            name="rule123"
            onChange={() => onRule123TypeChange("end")}
            type="radio"
          />
          <span>{labels.rule123Options.end}</span>
        </label>
      </div>

      <div
        className={
          useRule123 && rule123Type === "end"
            ? styles.nestedField
            : `${styles.nestedField} ${styles.disabled}`
        }
      >
        <input
          className={styles.configInput}
          disabled={!useRule123 || rule123Type !== "end"}
          inputMode="numeric"
          onChange={(event) => onEndCupLimitChange(event.target.value)}
          placeholder="0"
          type="text"
          value={endCupLimit}
        />
        <span>{labels.fields.endCupLimit}</span>
      </div>
    </div>
  );
}
