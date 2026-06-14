export default function RecommendationPanel({ state, lotInfo, tradingDisabled }) {
  return (
    <div className="recommendation-panel">
      <h2>Recommendation Engine</h2>
      <div className="recommendation-grid">
        <div className="rec-item">
          <span className="rec-label">Current Balance</span>
          <span className="rec-value">${state.currentBalance.toFixed(2)}</span>
        </div>
        <div className="rec-item">
          <span className="rec-label">Base Lot</span>
          <span className="rec-value">${lotInfo.baseLot}</span>
        </div>
        <div className="rec-item">
          <span className="rec-label">Loss Streak</span>
          <span className={`rec-value ${state.lossStreak >= 2 ? 'negative' : ''}`}>
            {state.lossStreak}
          </span>
        </div>
        <div className="rec-item rec-item--highlight">
          <span className="rec-label">Recommended Lot</span>
          <span className="rec-value rec-lot">
            {tradingDisabled ? '—' : `$${lotInfo.recommendedLot}`}
          </span>
        </div>
      </div>
      <p className="rec-reason">
        {tradingDisabled
          ? 'Trading disabled for this session.'
          : lotInfo.aPlusOnly
            ? `⚡ ${lotInfo.reason}`
            : lotInfo.reason}
      </p>
    </div>
  );
}
