import { useEffect, useRef } from "react";

const soundPaths = {
  "123": "/audios/123.wav",
  "456": "/audios/456.mp4",
  triple: "/audios/nnn.mp3",
  "111": "/audios/111.mp3",
  alive: "/audios/alive.mp3",
  cutin: "/audios/cutin.mp3",
  diceRoll: "/audios/dice_roll.mp3",
  end: "/audios/end.mp3",
  magic: "/audios/magic.mp3",
  stay: "/audios/stay.mp3",
} as const;

export type GameSound = keyof typeof soundPaths;

export default function useGameSounds() {
  const refs = useRef<Partial<Record<GameSound, HTMLAudioElement>>>({});

  useEffect(() => {
    refs.current = Object.fromEntries(
      Object.entries(soundPaths).map(([sound, path]) => {
        const audio = new Audio(path);
        audio.preload = "auto";
        audio.load();
        return [sound, audio];
      }),
    ) as Partial<Record<GameSound, HTMLAudioElement>>;
  }, []);

  return {
    play(sound: GameSound) {
      const audio = refs.current[sound];
      if (!audio) return;
      audio.currentTime = 0;
      void audio.play();
    },
  };
}
