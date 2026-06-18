import { getGameResultFromDiceValues } from "@/lib/game/dice";
import { labels } from "@/lib/game/labels";
import { getRollModeOption, isOutsideBoundary, shouldBurst } from "@/lib/game/rollMode";
import type { RollMode } from "@/lib/game/types";
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
  playerName: string;
  rollMode: RollMode;
  onRollResult: (result: number) => void;
};

type BurstDie = {
  id: number;
  mode: RollMode;
  face: number;
};

const burstDurations: Record<RollMode, number> = {
  gentle: 780,
  normal: 860,
  rough: 980,
};

export default function DiceRoller({ disabled, playerName, rollMode, onRollResult }: DiceRollerProps) {
  const reactId = useId();
  const containerId = `dice-box-${reactId.replace(/:/g, "")}`;
  const diceBoxRef = useRef<DiceBoxInstance | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const burstDieRef = useRef<HTMLDivElement | null>(null);
  const burstCounterRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [lastRollPlayerName, setLastRollPlayerName] = useState<string | null>(null);
  const [lastWasChai, setLastWasChai] = useState(false);
  const [burstDie, setBurstDie] = useState<BurstDie | null>(null);
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
    if (!diceBoxRef.current || disabled || isRolling) return;

    setIsRolling(true);
    setErrorMessage(null);
    setLastWasChai(false);

    const burstCandidate = shouldBurst(rollMode);
    const burstAnimation = burstCandidate ? startBurstAnimation(rollMode) : Promise.resolve(false);

    try {
      const rolls = await diceBoxRef.current.roll("3d6");
      const isChai = await burstAnimation;
      const result = isChai ? 0 : toGameResult(rolls);

      setLastResult(result);
      setLastWasChai(isChai);
      setLastRollPlayerName(playerName);
      onRollResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dice roll failed.");
    } finally {
      setIsRolling(false);
      window.setTimeout(() => setBurstDie(null), 260);
    }
  };

  const startBurstAnimation = async (mode: RollMode) => {
    const id = burstCounterRef.current + 1;
    burstCounterRef.current = id;
    setBurstDie({ id, mode, face: Math.floor(Math.random() * 6) + 1 });

    await waitForFrame();
    await waitForFrame();
    await wait(burstDurations[mode]);

    const targetRect = burstDieRef.current?.getBoundingClientRect();
    const boundaryRect = viewportRef.current?.getBoundingClientRect();
    if (!targetRect || !boundaryRect) return false;

    // Future sound hook: this is the exact branch where a dedicated chai sound should fire.
    return isOutsideBoundary(targetRect, boundaryRect, 4);
  };

  const summary = errorMessage
    ? errorMessage
    : lastResult === null
      ? `${playerName}：サイコロを振ってね`
      : `${lastRollPlayerName ?? playerName}：${lastWasChai ? "チャイ" : `出目 ${getResultLabel(lastResult)}`}`;
  const modeOption = getRollModeOption(rollMode);

  return (
    <section className={`${styles.diceRollPanel} ${isRolling && rollMode === "rough" ? styles.roughRoll : ""}`} aria-label="Dice roller">
      <div ref={viewportRef} id={containerId} className={styles.diceBoxViewport}>
        {burstDie && (
          <div
            key={burstDie.id}
            ref={burstDieRef}
            className={`${styles.burstDie} ${styles[`${burstDie.mode}Burst`]}`}
            aria-hidden="true"
          >
            {burstDie.face}
          </div>
        )}
      </div>
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
