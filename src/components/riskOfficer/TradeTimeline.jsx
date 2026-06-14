import { useState } from 'react';

const STATE_COLORS = {
  FLOW: '#22c55e',
  GREED: '#eab308',
  REVENGE: '#f97316',
  ACCOUNT_DESTRUCTION: '#ef4444',
};

export default function TradeTimeline({ trades }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`trade-timeline ${open ? 'trade-timeline--open' : ''}`}>
      <button
        type="button"
        className="timeline-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="timeline-toggle-left">
          <h2>Trade Timeline</h2>
          {trades.length > 0 && (
            <span className="timeline-count">{trades.length} trades</span>
          )}
        </span>
        <span className={`timeline-arrow ${open ? 'timeline-arrow--open' : ''}`}>
          ▼
        </span>
      </button>

      <div className={`timeline-collapse ${open ? 'timeline-collapse--open' : ''}`}>
        <div className="timeline-collapse-inner">
          {trades.length === 0 ? (
            <p className="timeline-empty">No trades recorded today. Your behavioral patterns will appear here.</p>
          ) : (
            <div className="timeline-table-wrap">
              <table className="timeline-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Result</th>
                    <th>Balance</th>
                    <th>State</th>
                    <th>Lot</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[...trades].reverse().map((t) => (
                    <tr key={t.tradeNumber}>
                      <td>{t.tradeNumber}</td>
                      <td>
                        <span className={`result-badge result-badge--${t.result.toLowerCase()}`}>
                          {t.result}
                        </span>
                      </td>
                      <td>${t.balanceAfter.toFixed(2)}</td>
                      <td>
                        <span style={{ color: STATE_COLORS[t.traderState] || '#fff' }}>
                          {t.traderState}
                        </span>
                      </td>
                      <td>${t.lotSize}</td>
                      <td className="timeline-time">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
