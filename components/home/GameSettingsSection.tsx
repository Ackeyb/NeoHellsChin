import { labels } from "@/lib/game/labels";
import type { RollMode, Rule123 } from "@/lib/game/types";
import type { ConfigInput } from "@/lib/game/validation";
import styles from "@/styles/Home.module.css";
import NumericField from "./NumericField";
import RandomConfigDiceRoller from "./RandomConfigDiceRoller";
import RollModeSelector from "./RollModeSelector";
import Rule123Settings from "./Rule123Settings";

type GameSettingsSectionProps = {
  config: ConfigInput;
  useRule123: boolean;
  rule123Type: Rule123["type"];
  rollMode: RollMode;
  endCupLimit: string;
  onConfigChange: (key: keyof ConfigInput, value: string) => void;
  onUseRule123Change: (enabled: boolean) => void;
  onRule123TypeChange: (type: Rule123["type"]) => void;
  onRollModeChange: (mode: RollMode) => void;
  onEndCupLimitChange: (value: string) => void;
};

export default function GameSettingsSection({
  config,
  useRule123,
  rule123Type,
  rollMode,
  endCupLimit,
  onConfigChange,
  onUseRule123Change,
  onRule123TypeChange,
  onRollModeChange,
  onEndCupLimitChange,
}: GameSettingsSectionProps) {
  return (
    <section className={styles.panel} aria-labelledby="settings-heading">
      <div className={styles.sectionHeading} id="settings-heading">
        {labels.sections.gameSettings}
      </div>

      <div className={styles.fieldStack}>
        <NumericField
          label={labels.fields.startCups}
          unit={labels.fields.cupsUnit}
          value={config.startCups}
          onChange={(value) => onConfigChange("startCups", value)}
        />
        <NumericField
          label={labels.fields.addPerRound}
          unit={labels.fields.cupsUnit}
          value={config.addPerRound}
          onChange={(value) => onConfigChange("addPerRound", value)}
        />
        <NumericField
          label={labels.fields.cutOff}
          unit="以下"
          value={config.cutOff}
          onChange={(value) => onConfigChange("cutOff", value)}
        />
      </div>

      <RandomConfigDiceRoller values={config} onConfigChange={onConfigChange} />

      <RollModeSelector value={rollMode} onChange={onRollModeChange} />

      <Rule123Settings
        endCupLimit={endCupLimit}
        rule123Type={rule123Type}
        useRule123={useRule123}
        onEndCupLimitChange={onEndCupLimitChange}
        onRule123TypeChange={onRule123TypeChange}
        onUseRule123Change={onUseRule123Change}
      />
    </section>
  );
}
