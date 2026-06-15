import { diceImagePaths } from "@/lib/game/results";
import { useEffect } from "react";

export default function PreloadDiceImages() {
  useEffect(() => {
    diceImagePaths.forEach((src) => {
      const img = new Image();
      img.src = `/images/${src}`;
    });
  }, []);

  return null;
}
