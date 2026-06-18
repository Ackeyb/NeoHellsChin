import { getGameResultFromDiceValues } from "@/lib/game/dice";
import { labels } from "@/lib/game/labels";
import { getRollModeOption, shouldBurst } from "@/lib/game/rollMode";
import type { RollMode } from "@/lib/game/types";
import styles from "@/styles/Game.module.css";
import { useEffect, useId, useRef, useState } from "react";

type DiceRoll = {
  value?: number | string;
};

type DiceBoxInstance = {
  init: () => Promise<DiceBoxInstance>;
  resizeWorld?: () => void;
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
  playerName: string;
  rollMode: RollMode;
  onRollResult: (result: number) => void;
};

const burstSettleDelayMs: Record<RollMode, number> = {
  gentle: 900,
  normal: 1050,
  rough: 1250,
};

export default function DiceRoller({ disabled, playerName, rollMode, onRollResult }: DiceRollerProps) {
  const reactId = useId();
  const containerId = `dice-box-${reactId.replace(/:/g, "")}`;
  const diceBoxRef = useRef<DiceBoxInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [lastRollPlayerName, setLastRollPlayerName] = useState<string | null>(null);
  const [lastWasChai, setLastWasChai] = useState(false);
  const [isBurstWorldOpen, setIsBurstWorldOpen] = useState(false);
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
          scale: 9,
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
    const diceBox = diceBoxRef.current;
    if (!diceBox || disabled || isRolling) return;

    setIsRolling(true);
    setErrorMessage(null);
    setLastWasChai(false);

    const isBurst = shouldBurst(rollMode);
    if (isBurst) {
      setIsBurstWorldOpen(true);
      await waitForFrame();
      await waitForFrame();
      diceBox.resizeWorld?.();
    }

    try {
      const rolls = await diceBox.roll("3d6");
      if (isBurst) await wait(burstSettleDelayMs[rollMode]);
      const result = isBurst ? 0 : toGameResult(rolls);

      setLastResult(result);
      setLastWasChai(isBurst);
      setLastRollPlayerName(playerName);
      onRollResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dice roll failed.");
    } finally {
      setIsRolling(false);
      if (isBurst) {
        setIsBurstWorldOpen(false);
        await waitForFrame();
        diceBox.resizeWorld?.();
      }
    }
  };

  const summary = errorMessage
    ? errorMessage
    : lastResult === null
      ? `${playerName}：サイコロを振ってね`
      : `${lastRollPlayerName ?? playerName}：${lastWasChai ? "チャイ" : `出目 ${getResultLabel(lastResult)}`}`;
  const modeOption = getRollModeOption(rollMode);

  return (
    <section
      className={`${styles.diceRollPanel} ${isRolling && rollMode === "rough" ? styles.roughRoll : ""} ${
        isBurstWorldOpen ? styles.burstWorldOpen : ""
      }`}
      aria-label="Dice roller"
    >
      <div id={containerId} className={styles.diceBoxViewport} />
      <div className={styles.rollSummary} aria-live="polite">
        {summary}
      </div>
      <button
        className="primary-button wide-button"
        disabled={disabled || !isReady || isRolling}
        onClick={rollDice}
        type="button"
        title={`${modeOption.label}: 暴発 ${Math.round(modeOption.burstChance * 100)}%`}
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

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}
