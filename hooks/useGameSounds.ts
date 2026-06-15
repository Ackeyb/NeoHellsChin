import type { ApplyResultOutcome } from "@/lib/game/types";
import { useEffect, useRef } from "react";

type GameSound = NonNullable<ApplyResultOutcome["sound"]>;

export default function useGameSounds() {
  const refs = {
    "123": useRef<HTMLAudioElement | null>(null),
    "456": useRef<HTMLAudioElement | null>(null),
    triple: useRef<HTMLAudioElement | null>(null),
    "111": useRef<HTMLAudioElement | null>(null),
  };

  useEffect(() => {
    refs["123"].current = new Audio("/audios/123.wav");
    refs["456"].current = new Audio("/audios/456.mp4");
    refs.triple.current = new Audio("/audios/nnn.mp3");
    refs["111"].current = new Audio("/audios/111.mp3");
  }, []);

  return {
    play(sound: GameSound) {
      const audio = refs[sound].current;
      if (!audio) return;
      audio.currentTime = 0;
      void audio.play();
    },
  };
}
