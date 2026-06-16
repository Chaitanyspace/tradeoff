import { AGGRESSION_PROFILES, PROFILE_ALIASES } from '../../utils/proLotEngine';

export default function GlowingStatePanel({ traderState, alerts }) {
  if (!traderState) return null;

  return (
    <div className="pro-glow-panel pro-glow-keep-sharp">
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

export function GlowingLotSuggestion({ lotInfo, profileId, tradingDisabled, lockMessage }) {
  const resolvedId = PROFILE_ALIASES[profileId] || profileId;
  const profile = AGGRESSION_PROFILES[resolvedId];

  if (!lotInfo) return null;

  const lockColor = '#ef4444';
  const lockGlow = 'rgba(239, 68, 68, 0.65)';

  return (
    <div
      className={`pro-glow-lot pro-glow-keep-sharp ${tradingDisabled ? 'pro-glow-lot--locked' : ''}`}
      style={{
        '--glow-color': tradingDisabled ? lockColor : (profile?.color || '#818cf8'),
        '--glow-shadow': tradingDisabled ? lockGlow : (profile?.glow || 'rgba(129, 140, 248, 0.5)'),
      }}
    >
      <span className="pro-glow-lot-label">
        {tradingDisabled ? 'SESSION ENDED' : 'USE THIS LOT SIZE'}
      </span>
      <span className="pro-glow-lot-value">
        {tradingDisabled ? 'STOP' : `$${lotInfo.recommendedLot}`}
      </span>
      <p className="pro-glow-lot-reason">
        {tradingDisabled
          ? lockMessage || 'Session limit reached. Close the platform.'
          : lotInfo.reason}
      </p>
      {lotInfo.stepsLabel && (
        <div className="pro-glow-lot-steps">
          <span className="pro-glow-lot-steps-label">Live options at ${lotInfo.band?.balance ?? '—'}</span>
          <span className="pro-glow-lot-steps-values">{lotInfo.stepsLabel}</span>
        </div>
      )}
      {!tradingDisabled && lotInfo.rangeLabel && (
        <span className="pro-glow-lot-band">
          Live at ${lotInfo.band?.balance ?? '—'} · band {lotInfo.rangeLabel}
          {lotInfo.band?.growthMode === 'mild' ? ' · mild growth' : ''}
        </span>
      )}
      {!tradingDisabled && lotInfo.aPlusOnly && (
        <span className="pro-glow-lot-badge">A+ SETUPS ONLY</span>
      )}
    </div>
  );
}
