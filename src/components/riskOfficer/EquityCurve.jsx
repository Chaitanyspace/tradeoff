import { useMemo } from 'react';
import './EquityCurve.css';

const PAD = { top: 28, right: 24, bottom: 44, left: 56 };

function buildPoints(startingBalance, trades, currentBalance) {
  const points = [{ tradeNumber: 0, balance: startingBalance, result: 'START' }];
  trades.forEach((t) => {
    points.push({
      tradeNumber: t.tradeNumber,
      balance: t.balanceAfter,
      result: t.result,
    });
  });

  if (points[points.length - 1].balance !== currentBalance) {
    points.push({
      tradeNumber: trades.length,
      balance: currentBalance,
      result: 'NOW',
    });
  }

  return points;
}

export default function EquityCurve({
  startingBalance,
  peakBalance,
  currentBalance,
  trades,
}) {
  const points = useMemo(
    () => buildPoints(startingBalance, trades, currentBalance),
    [startingBalance, trades, currentBalance]
  );

  const chart = useMemo(() => {
    const width = 480;
    const height = 360;
    const innerW = width - PAD.left - PAD.right;
    const innerH = height - PAD.top - PAD.bottom;

    const balances = points.map((p) => p.balance);
    const allValues = [...balances, startingBalance, peakBalance];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const yPad = range * 0.12;
    const yMin = minVal - yPad;
    const yMax = maxVal + yPad;
    const yRange = yMax - yMin;

    const xFor = (i) =>
      PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);

    const yFor = (val) => PAD.top + innerH - ((val - yMin) / yRange) * innerH;

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.balance).toFixed(1)}`)
      .join(' ');

    const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(1)} ${yFor(yMin).toFixed(1)} L ${xFor(0).toFixed(1)} ${yFor(yMin).toFixed(1)} Z`;

    const startY = yFor(startingBalance);
    const peakY = yFor(peakBalance);
    const currentY = yFor(currentBalance);

    const yTicks = 5;
    const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
      const val = yMin + (yRange / yTicks) * i;
      return { val, y: yFor(val) };
    });

    return {
      width,
      height,
      innerW,
      points,
      linePath,
      areaPath,
      startY,
      peakY,
      currentY,
      gridLines,
      xFor,
      yFor,
      yMin,
      yMax,
    };
  }, [points, startingBalance, peakBalance, currentBalance]);

  const pnl = currentBalance - startingBalance;
  const isUp = pnl >= 0;

  return (
    <div className="equity-curve">
      <div className="equity-curve-header">
        <h2>Equity Curve</h2>
        <span className={`equity-pnl ${isUp ? 'positive' : 'negative'}`}>
          {isUp ? '+' : ''}{pnl.toFixed(2)}
        </span>
      </div>

      <div className="equity-curve-chart">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="equity-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="equityLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor={isUp ? '#22c55e' : '#ef4444'} />
            </linearGradient>
          </defs>

          {chart.gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={g.y}
                x2={chart.width - PAD.right}
                y2={g.y}
                className="equity-grid-line"
              />
              <text x={PAD.left - 8} y={g.y + 4} className="equity-axis-label" textAnchor="end">
                ${g.val.toFixed(0)}
              </text>
            </g>
          ))}

          <line
            x1={PAD.left}
            y1={chart.startY}
            x2={chart.width - PAD.right}
            y2={chart.startY}
            className="equity-ref-line equity-ref-line--start"
          />
          <text
            x={chart.width - PAD.right}
            y={chart.startY - 6}
            className="equity-ref-label equity-ref-label--start"
            textAnchor="end"
          >
            Start ${startingBalance.toFixed(0)}
          </text>

          {peakBalance > startingBalance && (
            <>
              <line
                x1={PAD.left}
                y1={chart.peakY}
                x2={chart.width - PAD.right}
                y2={chart.peakY}
                className="equity-ref-line equity-ref-line--peak"
              />
              <text
                x={chart.width - PAD.right}
                y={chart.peakY - 6}
                className="equity-ref-label equity-ref-label--peak"
                textAnchor="end"
              >
                Peak ${peakBalance.toFixed(0)}
              </text>
            </>
          )}

          <path d={chart.areaPath} fill="url(#equityFill)" className="equity-area" />
          <path d={chart.linePath} fill="none" stroke="url(#equityLine)" strokeWidth="2.5" className="equity-line" />

          {chart.points.map((p, i) => {
            const cx = chart.xFor(i);
            const cy = chart.yFor(p.balance);
            const isLast = i === chart.points.length - 1;
            const isStart = p.result === 'START';

            if (isStart) {
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={5}
                  className="equity-dot equity-dot--start"
                />
              );
            }

            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLast ? 7 : 5}
                  className={`equity-dot equity-dot--${p.result.toLowerCase()} ${isLast ? 'equity-dot--current' : ''}`}
                />
                {!isLast && p.result !== 'NOW' && (
                  <text x={cx} y={chart.height - 14} className="equity-x-label" textAnchor="middle">
                    {p.tradeNumber}
                  </text>
                )}
              </g>
            );
          })}

          {chart.points.length > 1 && (
            <text
              x={chart.xFor(chart.points.length - 1)}
              y={chart.height - 14}
              className="equity-x-label equity-x-label--now"
              textAnchor="middle"
            >
              now
            </text>
          )}
        </svg>
      </div>

      <div className="equity-legend">
        <div className="equity-legend-item">
          <span className="equity-legend-dot equity-legend-dot--start" />
          Start
        </div>
        <div className="equity-legend-item">
          <span className="equity-legend-dot equity-legend-dot--win" />
          Win
        </div>
        <div className="equity-legend-item">
          <span className="equity-legend-dot equity-legend-dot--loss" />
          Loss
        </div>
        <div className="equity-legend-item">
          <span className="equity-legend-dash equity-legend-dash--peak" />
          Peak
        </div>
      </div>

      <div className="equity-stats">
        <div className="equity-stat">
          <span className="equity-stat-label">Start</span>
          <span className="equity-stat-value">${startingBalance.toFixed(2)}</span>
        </div>
        <div className="equity-stat">
          <span className="equity-stat-label">Peak</span>
          <span className="equity-stat-value positive">${peakBalance.toFixed(2)}</span>
        </div>
        <div className="equity-stat">
          <span className="equity-stat-label">Current</span>
          <span className={`equity-stat-value ${isUp ? 'positive' : 'negative'}`}>
            ${currentBalance.toFixed(2)}
          </span>
        </div>
        <div className="equity-stat">
          <span className="equity-stat-label">Trades</span>
          <span className="equity-stat-value">{trades.length}</span>
        </div>
      </div>
    </div>
  );
}
