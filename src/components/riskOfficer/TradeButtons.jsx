export default function TradeButtons({
  tradingDisabled,
  onWin,
  onLoss,
  tradeCount,
  maxTrades,
  lossStreak,
  maxLosses,
}) {
  const disabled = tradingDisabled;

  return (
    <div className="trade-buttons-section">
      <div className="trade-buttons-meta">
        <span>Trade {tradeCount} of {maxTrades}</span>
        <span className={lossStreak >= 2 ? 'negative' : ''}>
          Loss streak: {lossStreak} / {maxLosses}
        </span>
      </div>
      <div className="trade-buttons">
        <button
          className="trade-btn trade-btn--win"
          onClick={onWin}
          disabled={disabled}
        >
          WIN
        </button>
        <button
          className="trade-btn trade-btn--loss"
          onClick={onLoss}
          disabled={disabled}
        >
          LOSS
        </button>
      </div>
      {disabled && (
        <p className="trade-disabled-msg">
          {tradeCount >= maxTrades
            ? 'SESSION COMPLETE — Quality > Quantity'
            : lossStreak >= maxLosses
              ? 'SESSION OVER — Close the PC. Tomorrow is another day.'
              : 'Trading disabled.'}
        </p>
      )}
    </div>
  );
}
