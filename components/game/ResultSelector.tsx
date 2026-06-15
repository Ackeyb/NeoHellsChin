import { labels } from "@/lib/game/labels";
import { resultChoices } from "@/lib/game/results";
import styles from "@/styles/Game.module.css";

type ResultSelectorProps = {
  selectedResult: number | null;
  onSelect: (result: number) => void;
};

export default function ResultSelector({ selectedResult, onSelect }: ResultSelectorProps) {
  const diceChoices = resultChoices.filter(
    (choice) => choice.image && choice.value >= 1 && choice.value <= 6,
  );
  const specialChoices = resultChoices.filter(
    (choice) => choice.image && (choice.value < 0 || choice.value >= 100),
  );

  return (
    <section className={styles.resultPanel} aria-label="Result choices">
      <button
        className={selectedResult === 0 ? `${styles.textChoice} ${styles.selected}` : styles.textChoice}
        onClick={() => onSelect(0)}
        type="button"
      >
        {labels.resultChoices.none}
      </button>

      <div className={styles.diceChoiceGrid}>
        {diceChoices.map((choice) => (
          <ResultImageButton
            choice={choice}
            key={choice.id}
            selectedResult={selectedResult}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className={styles.specialChoiceGrid}>
        {specialChoices.map((choice) => (
          <ResultImageButton
            choice={choice}
            key={choice.id}
            selectedResult={selectedResult}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function ResultImageButton({
  choice,
  selectedResult,
  onSelect,
}: {
  choice: (typeof resultChoices)[number];
  selectedResult: number | null;
  onSelect: (result: number) => void;
}) {
  if (!choice.image) return null;

  return (
    <button
      aria-label={labels.resultChoices[choice.labelKey]}
      className={styles.imageChoice}
      onClick={() => onSelect(choice.value)}
      type="button"
    >
      <img
        src={selectedResult === choice.value ? choice.image.selected : choice.image.normal}
        alt={choice.image.alt}
      />
    </button>
  );
}
