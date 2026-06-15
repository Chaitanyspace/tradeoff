import { AGGRESSION_PROFILES } from '../../utils/proLotEngine';

export default function ProTradeButtons({
  tradingDisabled,
  onWin,
  onLoss,
  tradeCount,
  maxTrades,
  lossStreak,
  maxLosses,
}) {
  return (
    <div className="pro-trade-section">
      <div className="pro-trade-meta">
        <span>Trade {tradeCount} / {maxTrades}</span>
        <span className={lossStreak >= 2 ? 'negative' : ''}>
          Loss streak: {lossStreak} / {maxLosses}
        </span>
      </div>
      <div className="pro-trade-buttons">
        <button
          className="pro-trade-btn pro-trade-btn--win"
          onClick={onWin}
          disabled={tradingDisabled}
        >
          WIN
        </button>
        <button
          className="pro-trade-btn pro-trade-btn--loss"
          onClick={onLoss}
          disabled={tradingDisabled}
        >
          LOSS
        </button>
      </div>
      {tradingDisabled && (
        <p className="pro-trade-stop">
          {tradeCount >= maxTrades
            ? 'SESSION COMPLETE — Quality over quantity.'
            : 'SESSION OVER — Close the PC. You will blow the account if you continue.'}
        </p>
      )}
    </div>
  );
}

export function ProSessionBar({ state, profileId, profitMetrics, onReset }) {
  const profile = AGGRESSION_PROFILES[profileId];

  return (
    <div className="pro-session-bar">
      <div className="pro-session-info">
        <span
          className="pro-session-profile"
          style={{ color: profile?.color, textShadow: `0 0 12px ${profile?.glow}` }}
        >
          {profile?.label || '—'}
        </span>
        <span className="pro-session-balance">${state.currentBalance.toFixed(2)}</span>
        <span className="pro-session-stat">
          Peak ${state.peakBalance.toFixed(2)}
        </span>
        <span className="pro-session-stat">
          Trades {state.tradeCount}/{state.maxTrades || 7}
        </span>
        <span className="pro-session-stat">
          Giveback {profitMetrics.givebackPercentage}%
        </span>
      </div>
      <button className="ro-btn-secondary" onClick={onReset}>
        New Session
      </button>
    </div>
  );
}
