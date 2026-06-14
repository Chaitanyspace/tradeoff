import { useState } from 'react';

export default function StatGrid({
  state,
  profitMetrics,
  traderState,
  sessionStatus,
  maxTrades,
  maxLosses,
}) {
  const [open, setOpen] = useState(false);

  const stats = [
    {
      label: 'Current Balance',
      value: `$${state.currentBalance.toFixed(2)}`,
      highlight: true,
    },
    {
      label: 'Peak Balance',
      value: `$${state.peakBalance.toFixed(2)}`,
    },
    {
      label: 'Starting Balance',
      value: `$${state.startingBalance.toFixed(2)}`,
    },
    {
      label: 'Profit Made',
      value: `$${profitMetrics.profitMade.toFixed(2)}`,
      positive: true,
    },
    {
      label: 'Profit Given Back',
      value: `$${profitMetrics.profitGivenBack.toFixed(2)}`,
      negative: profitMetrics.profitGivenBack > 0,
    },
    {
      label: 'Giveback %',
      value: `${profitMetrics.givebackPercentage}%`,
      negative: profitMetrics.givebackPercentage >= 20,
    },
    {
      label: 'Trading State',
      value: traderState.label,
      stateColor: traderState.color,
    },
    {
      label: 'Trades Today',
      value: `${state.tradeCount} / ${maxTrades}`,
    },
    {
      label: 'Session Status',
      value: sessionStatus.label,
      stateColor: sessionStatus.color,
    },
  ];

  return (
    <div className={`stat-section trade-timeline  ${open ? 'stat-section--open' : ''}`} >
      <button
        type="button"
        className="timeline-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="timeline-toggle-left">
          <h2>Trading Statistics</h2>
          <span className="timeline-count">
            {stats.length} metrics
          </span>
        </span>

        <span
          className={`timeline-arrow ${
            open ? 'timeline-arrow--open' : ''
          }`}
        >
          ▼
        </span>
      </button>

      <div
        className={`timeline-collapse ${
          open ? 'timeline-collapse--open' : ''
        }`}
      >
        <div className="timeline-collapse-inner">
          <div className="stat-grid">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`stat-card ${
                  s.highlight ? 'stat-card--highlight' : ''
                }`}
              >
                <span className="stat-label">{s.label}</span>

                <span
                  className={`stat-value ${
                    s.positive ? 'positive' : ''
                  } ${s.negative ? 'negative' : ''}`}
                  style={
                    s.stateColor
                      ? { color: s.stateColor }
                      : undefined
                  }
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}