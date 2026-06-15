import { labels } from "@/lib/game/labels";

export type EffectState = {
  curse: boolean;
  happy: boolean;
  happier: boolean;
  happiest: boolean;
  finish: boolean;
  nextRound: boolean;
  revive: boolean;
};

type GameEffectsProps = {
  effects: EffectState;
};

type SpecialEffectType = "curse" | "happy" | "happier" | "happiest";
type CutInEffectType = "finish" | "nextRound" | "revive";

export const initialEffects: EffectState = {
  curse: false,
  happy: false,
  happier: false,
  happiest: false,
  finish: false,
  nextRound: false,
  revive: false,
};

export default function GameEffects({ effects }: GameEffectsProps) {
  return (
    <>
      {effects.curse && <SpecialEffectOverlay type="curse" title="123" />}
      {effects.happy && <SpecialEffectOverlay type="happy" title="456" />}
      {effects.happier && <SpecialEffectOverlay type="happier" title="ゾロ目" />}
      {effects.happiest && <SpecialEffectOverlay type="happiest" title="ピンゾロ" />}
      {effects.finish && <CutInEffect type="finish" title={labels.overlays.finish} />}
      {effects.nextRound && <CutInEffect type="nextRound" title={labels.overlays.nextRound} />}
      {effects.revive && <CutInEffect type="revive" title={labels.overlays.revive} />}
    </>
  );
}

function SpecialEffectOverlay({ type, title }: { type: SpecialEffectType; title: string }) {
  return (
    <div className={`special-effect-overlay ${type}-effect`}>
      <div className="effect-burst" />
      <div className="effect-rings" />
      <div className="effect-card">
        <span className="effect-title">{title}</span>
      </div>
      <div className="effect-particles" />
    </div>
  );
}

function CutInEffect({ type, title }: { type: CutInEffectType; title: string }) {
  return (
    <div className={`cut-in-overlay ${type}-cut-in`}>
      <div className="cut-in-slash" />
      <div className="cut-in-text">{title}</div>
    </div>
  );
}
