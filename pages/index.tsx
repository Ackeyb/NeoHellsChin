import ErrorDialog from "@/components/ErrorDialog";
import GameSettingsSection from "@/components/home/GameSettingsSection";
import HomeHeader from "@/components/home/HomeHeader";
import PlayerDialog from "@/components/home/PlayerDialog";
import PlayerSection from "@/components/home/PlayerSection";
import StartActions from "@/components/home/StartActions";
import { labels } from "@/lib/game/labels";
import { defaultRollMode } from "@/lib/game/rollMode";
import { loadResumePlayerNames, saveGameSetup } from "@/lib/game/storage";
import type { GameMode, RollMode, Rule123 } from "@/lib/game/types";
import { type ConfigInput, validateConfig, validatePlayers } from "@/lib/game/validation";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const defaultConfig: ConfigInput = {
  startCups: "",
  addPerRound: "",
  cutOff: "",
};

export default function Home() {
  const router = useRouter();
  const [config, setConfig] = useState<ConfigInput>(defaultConfig);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [backupPlayers, setBackupPlayers] = useState<string[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [useRule123, setUseRule123] = useState(false);
  const [rule123Type, setRule123Type] = useState<Rule123["type"]>("revive");
  const [endCupLimit, setEndCupLimit] = useState("");
  const [rollMode, setRollMode] = useState<RollMode>(defaultRollMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const names = loadResumePlayerNames();
    if (names.length === 0) return;
    setPlayers(names);
    setPlayerCount(names.length);
  }, []);

  const updateNumericConfig = (key: keyof ConfigInput, value: string) => {
    if (/^\d*$/.test(value)) {
      setConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  const openPlayerDialog = () => {
    const count = players.length > 0 ? players.length : 2;
    setBackupPlayers(players);
    setPlayerCount(count);
    setPlayers((prev) => resizePlayers(prev, count));
    setIsPlayerDialogOpen(true);
  };

  const changePlayerCount = (count: number) => {
    setPlayerCount(count);
    setPlayers((prev) => resizePlayers(prev, count));
  };

  const changePlayerName = (index: number, name: string) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const changeRule123Enabled = (enabled: boolean) => {
    setUseRule123(enabled);
    if (!enabled) {
      setRule123Type("revive");
      setEndCupLimit("");
    }
  };

  const changeRule123Type = (type: Rule123["type"]) => {
    setRule123Type(type);
    if (type === "revive") setEndCupLimit("");
  };

  const changeEndCupLimit = (value: string) => {
    if (/^\d*$/.test(value)) setEndCupLimit(value);
  };

  const confirmPlayers = () => {
    try {
      validatePlayers(players);
      setIsPlayerDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
    }
  };

  const startGame = (mode: GameMode) => {
    try {
      const validPlayers = validatePlayers(players);
      const parsedConfig = validateConfig(config);
      const rule123 = buildRule123();

      saveGameSetup({
        players: validPlayers,
        config: parsedConfig,
        rule123,
        mode,
        rollMode,
      });

      router.push(mode === "lose" ? "/play" : "/play2");
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
    }
  };

  const buildRule123 = (): Rule123 | null => {
    if (!useRule123) return null;
    if (rule123Type === "revive") return { type: "revive", endCupLimit: null };

    const limit = Number(endCupLimit);
    if (!limit || Number.isNaN(limit) || limit <= 0) {
      throw new Error(labels.messages.invalidEndCupLimit);
    }

    return { type: "end", endCupLimit: limit };
  };

  return (
    <main className={styles.homeShell}>
      <HomeHeader />
      <PlayerSection
        players={players}
        onOpenDialog={openPlayerDialog}
        onRemovePlayer={(index) => setPlayers((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
      />
      <GameSettingsSection
        config={config}
        endCupLimit={endCupLimit}
        rule123Type={rule123Type}
        rollMode={rollMode}
        useRule123={useRule123}
        onConfigChange={updateNumericConfig}
        onEndCupLimitChange={changeEndCupLimit}
        onRule123TypeChange={changeRule123Type}
        onRollModeChange={setRollMode}
        onUseRule123Change={changeRule123Enabled}
      />
      <StartActions onStart={startGame} />

      {isPlayerDialogOpen && (
        <PlayerDialog
          playerCount={playerCount}
          players={players}
          onCancel={() => {
            setPlayers(backupPlayers);
            setIsPlayerDialogOpen(false);
          }}
          onDone={confirmPlayers}
          onPlayerCountChange={changePlayerCount}
          onPlayerNameChange={changePlayerName}
        />
      )}

      <ErrorDialog
        open={errorMessage !== null}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </main>
  );
}

function resizePlayers(players: string[], count: number) {
  const next = [...players];
  while (next.length < count) next.push("");
  return next.slice(0, count);
}
