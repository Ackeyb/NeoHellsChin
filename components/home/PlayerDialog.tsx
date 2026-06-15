import { labels } from "@/lib/game/labels";
import { PLAYER_NAME_MAX_LENGTH } from "@/lib/game/validation";

type PlayerDialogProps = {
  players: string[];
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
  onPlayerNameChange: (index: number, name: string) => void;
  onCancel: () => void;
  onDone: () => void;
};

export default function PlayerDialog({
  players,
  playerCount,
  onPlayerCountChange,
  onPlayerNameChange,
  onCancel,
  onDone,
}: PlayerDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog player-dialog" role="dialog" aria-modal="true">
        <div className="dialog-title">{labels.sections.playerDialogTitle}</div>
        <label className="dialog-field">
          <span>{labels.fields.playerCount}</span>
          <select value={playerCount} onChange={(event) => onPlayerCountChange(Number(event.target.value))}>
            {Array.from({ length: 9 }, (_, index) => index + 2).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <div className="dialog-field-list">
          {players.map((name, index) => (
            <input
              key={index}
              maxLength={PLAYER_NAME_MAX_LENGTH}
              onChange={(event) => onPlayerNameChange(index, event.target.value.slice(0, PLAYER_NAME_MAX_LENGTH))}
              placeholder={`${labels.fields.playerName}${index + 1}`}
              type="text"
              value={name}
            />
          ))}
        </div>

        <div className="dialog-actions">
          <button className="secondary-button" onClick={onCancel} type="button">
            {labels.actions.cancel}
          </button>
          <button className="primary-button" onClick={onDone} type="button">
            {labels.actions.done}
          </button>
        </div>
      </div>
    </div>
  );
}
