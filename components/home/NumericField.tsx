type NumericFieldProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
};

export default function NumericField({ label, unit, value, onChange }: NumericFieldProps) {
  return (
    <label className={styles.numericField}>
      <span>{label}</span>
      <input
        className={styles.configInput}
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        type="text"
        value={value}
      />
      <span>{unit}</span>
    </label>
  );
}
import styles from "@/styles/Home.module.css";
