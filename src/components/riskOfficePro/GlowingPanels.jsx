import { AGGRESSION_PROFILES } from '../../utils/proLotEngine';

export default function GlowingStatePanel({ traderState, alerts }) {
  if (!traderState) return null;

  return (
    <div className="pro-glow-panel">
      <div
        className="pro-glow-state"
        style={{
          '--glow-color': traderState.color,
          '--glow-shadow': traderState.glow,
        }}
      >
        <span className="pro-glow-state-label">{traderState.label}</span>
        <p className="pro-glow-state-msg">{traderState.message}</p>
      </div>

      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`pro-glow-alert ${alert.pulse ? 'pro-glow-alert--pulse' : ''}`}
          style={{
            '--glow-color': alert.color,
            '--glow-shadow': alert.glow,
          }}
        >
          {alert.text}
        </div>
      ))}
    </div>
  );
}

export function GlowingLotSuggestion({ lotInfo, profileId, tradingDisabled }) {
  const profile = AGGRESSION_PROFILES[profileId];

  if (!lotInfo) return null;

  return (
    <div
      className={`pro-glow-lot ${tradingDisabled ? 'pro-glow-lot--disabled' : ''}`}
      style={{
        '--glow-color': profile?.color || '#818cf8',
        '--glow-shadow': profile?.glow || 'rgba(129, 140, 248, 0.5)',
      }}
    >
      <span className="pro-glow-lot-label">
        {tradingDisabled ? 'TRADING STOPPED' : 'USE THIS LOT SIZE'}
      </span>
      <span className="pro-glow-lot-value">
        {tradingDisabled ? '—' : `$${lotInfo.recommendedLot}`}
      </span>
      <p className="pro-glow-lot-reason">
        {tradingDisabled
          ? 'Session limit reached. Close the platform.'
          : lotInfo.reason}
      </p>
      {!tradingDisabled && lotInfo.rangeLabel && (
        <span className="pro-glow-lot-band">Band: {lotInfo.rangeLabel}</span>
      )}
      {!tradingDisabled && lotInfo.aPlusOnly && (
        <span className="pro-glow-lot-badge">A+ SETUPS ONLY</span>
      )}
    </div>
  );
}
