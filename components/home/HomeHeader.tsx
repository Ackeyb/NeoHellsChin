import { labels } from "@/lib/game/labels";
import styles from "@/styles/Home.module.css";

export default function HomeHeader() {
  return (
    <header className={styles.homeHeader}>
      <h1>{labels.appTitle}</h1>
      <p>{labels.appSubtitle}</p>
    </header>
  );
}
