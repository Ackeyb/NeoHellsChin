import {
  diceCountWeights,
  pickWeightedValue,
  sumDiceRolls,
} from "@/lib/game/randomSettings";
import type { ConfigInput } from "@/lib/game/validation";
import styles from "@/styles/Home.module.css";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type DiceRoll = {
  value?: number | string;
};

type DiceRollGroup = {
  value?: number | string;
  rolls?: DiceRoll[];
};

type DiceBoxInstance = {
  init: () => Promise<DiceBoxInstance>;
  roll: (notation: string) => Promise<DiceRoll[]>;
  getRollResults: () => DiceRollGroup[];
};

type DiceBoxConstructor = new (options: {
  assetPath: string;
  container: string;
  scale?: number;
  themeColor?: string;
}) => DiceBoxInstance;

type RandomConfigDiceRollerProps = {
  values: ConfigInput;
  onConfigChange: (key: keyof ConfigInput, value: string) => void;
};

type RollKey = "startCups" | "addPerRound" | "cutOff";

const rollFields: Array<{ key: RollKey; label: string }> = [
  { key: "startCups", label: "開始杯数" },
  { key: "addPerRound", label: "増加杯数" },
  { key: "cutOff", label: "無効にする出目" },
];

const visualRollDurationMs = 2400;

export default function RandomConfigDiceRoller({
  values,
  onConfigChange,
}: RandomConfigDiceRollerProps) {
  const reactId = useId().replace(/:/g, "");
  const boxIds = useMemo(
    () => ({
      startCups: `random-start-${reactId}`,
      addPerRound: `random-add-${reactId}`,
      cutOff: `random-cutoff-${reactId}`,
    }),
    [reactId],
  );
  const boxesRef = useRef<Partial<Record<RollKey, DiceBoxInstance>>>({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingRoll, setPendingRoll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isPanelOpen || isReady) return;
    let cancelled = false;

    async function setupDiceBoxes() {
      try {
        const module = await import("@3d-dice/dice-box");
        const DiceBox = module.default as DiceBoxConstructor;
        const entries = await Promise.all(
          rollFields.map(async ({ key }) => {
            const box = new DiceBox({
              assetPath: "/assets/",
              container: `#${boxIds[key]}`,
              scale: 9,
              themeColor: key === "cutOff" ? "#ff7f6e" : "#00a9b7",
            });
            await box.init();
            return [key, box] as const;
          }),
        );

        if (cancelled) return;
        boxesRef.current = Object.fromEntries(entries);
        setIsReady(true);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "Dice boxes failed to load.");
      }
    }

    setupDiceBoxes();

    return () => {
      cancelled = true;
    };
  }, [boxIds, isPanelOpen, isReady]);

  useEffect(() => {
    if (!pendingRoll || !isReady || isRolling) return;
    setPendingRoll(false);
    void rollAllSettings();
  }, [isReady, isRolling, pendingRoll]);

  const openAndRoll = () => {
    setIsPanelOpen(true);
    setPendingRoll(true);
    setErrorMessage(null);
  };

  const rollAllSettings = async () => {
    const startBox = boxesRef.current.startCups;
    const addBox = boxesRef.current.addPerRound;
    const cutOffBox = boxesRef.current.cutOff;
    if (!startBox || !addBox || !cutOffBox) return;

    setIsRolling(true);
    setErrorMessage(null);

    const startQty = pickWeightedValue(diceCountWeights);
    const addQty = pickWeightedValue(diceCountWeights);

    try {
      const [startRolls, addRolls, cutOffRolls] = await Promise.all([
        rollForDisplay(startBox, `${startQty}d6`),
        rollForDisplay(addBox, `${addQty}d6`),
        rollForDisplay(cutOffBox, "1d6"),
      ]);

      onConfigChange("startCups", String(Math.max(1, sumDiceRolls(startRolls))));
      onConfigChange("addPerRound", String(Math.max(1, sumDiceRolls(addRolls))));
      onConfigChange("cutOff", String(Math.max(1, sumDiceRolls(cutOffRolls))));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dice roll failed.");
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className={styles.randomConfigArea}>
      <button
        className={styles.randomConfigButton}
        disabled={isRolling}
        onClick={openAndRoll}
        type="button"
      >
        {isRolling ? "サイコロ中..." : "サイコロで決める"}
      </button>

      {isPanelOpen && (
        <div className={styles.randomConfigPanel} aria-label="Random game settings">
          {rollFields.map(({ key, label }) => (
            <div className={styles.randomConfigColumn} key={key}>
              <div className={styles.randomConfigLabel}>{label}</div>
              <div id={boxIds[key]} className={styles.randomConfigDiceBox} />
              <div className={styles.randomConfigResult}>{values[key] || "-"}</div>
            </div>
          ))}
        </div>
      )}

      {errorMessage && <div className={styles.randomConfigError}>{errorMessage}</div>}
    </div>
  );
}

async function rollForDisplay(box: DiceBoxInstance, notation: string) {
  const rollPromise = box.roll(notation);
  rollPromise.catch(() => undefined);
  const result = await Promise.race([rollPromise, wait(visualRollDurationMs)]);
  return Array.isArray(result) && result.length > 0 ? result : readRollsFromBox(box);
}

function readRollsFromBox(box: DiceBoxInstance) {
  return box.getRollResults().flatMap((group) => group.rolls ?? [{ value: group.value }]);
}

function wait(ms: number) {
  return new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms));
}
