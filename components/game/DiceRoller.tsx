import { getGameResultFromDiceValues } from "@/lib/game/dice";
import { labels } from "@/lib/game/labels";
import styles from "@/styles/Game.module.css";
import { useEffect, useId, useRef, useState } from "react";

type DiceRoll = {
  value?: number | string;
};

type DiceBoxInstance = {
  init: () => Promise<DiceBoxInstance>;
  roll: (notation: string) => Promise<DiceRoll[]>;
};

type DiceBoxConstructor = new (options: {
  assetPath: string;
  container: string;
  scale?: number;
  themeColor?: string;
}) => DiceBoxInstance;

type DiceRollerProps = {
  disabled: boolean;
  onRollResult: (result: number) => void;
};

export default function DiceRoller({ disabled, onRollResult }: DiceRollerProps) {
  const reactId = useId();
  const containerId = `dice-box-${reactId.replace(/:/g, "")}`;
  const diceBoxRef = useRef<DiceBoxInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupDiceBox() {
      try {
        const module = await import("@3d-dice/dice-box");
        const DiceBox = module.default as DiceBoxConstructor;
        const diceBox = new DiceBox({
          assetPath: "/assets/",
          container: `#${containerId}`,
          scale: 18,
          themeColor: "#00a9b7",
        });

        await diceBox.init();
        if (cancelled) return;
        diceBoxRef.current = diceBox;
        setIsReady(true);
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "Dice box failed to load.");
      }
    }

    setupDiceBox();

    return () => {
      cancelled = true;
      diceBoxRef.current = null;
    };
  }, [containerId]);

  const rollDice = async () => {
    if (!diceBoxRef.current || disabled || isRolling) return;

    setIsRolling(true);
    setErrorMessage(null);

    try {
      const rolls = await diceBoxRef.current.roll("3d6");
      const result = toGameResult(rolls);
      setLastResult(result);
      onRollResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dice roll failed.");
    } finally {
      setIsRolling(false);
    }
  };

  const summary = errorMessage
    ? errorMessage
    : lastResult === null
      ? "サイコロを振ってね"
      : `出目: ${getResultLabel(lastResult)}`;

  return (
    <section className={styles.diceRollPanel} aria-label="Dice roller">
      <div id={containerId} className={styles.diceBoxViewport} />
      <div className={styles.rollSummary} aria-live="polite">
        {summary}
      </div>
      <button
        className="primary-button wide-button"
        disabled={disabled || !isReady || isRolling}
        onClick={rollDice}
        type="button"
      >
        {isRolling ? "サイコロ中..." : "サイコロを振る"}
      </button>
    </section>
  );
}

function toGameResult(rolls: DiceRoll[]) {
  return getGameResultFromDiceValues(
    rolls
      .map((roll) => Number(roll.value))
      .filter((value) => Number.isInteger(value)),
  );
}

function getResultLabel(result: number) {
  if (result <= -100) return labels.resultChoices.special123;
  if (result === 0) return labels.resultChoices.none;
  if (result >= 300) return labels.resultChoices.special111;
  if (result >= 200) return labels.resultChoices.specialTriple;
  if (result >= 100) return labels.resultChoices.special456;
  return labels.resultChoices[`dice${result}` as keyof typeof labels.resultChoices];
}
