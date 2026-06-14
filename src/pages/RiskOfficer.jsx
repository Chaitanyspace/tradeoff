import { useState } from 'react';
import { useRiskOfficer } from '../hooks/useRiskOfficer';
import EquityCurve from '../components/riskOfficer/EquityCurve';
import WarningCards from '../components/riskOfficer/WarningCards';
import StatGrid from '../components/riskOfficer/StatGrid';
import StateBanner from '../components/riskOfficer/StateBanner';
import RecommendationPanel from '../components/riskOfficer/RecommendationPanel';
import TradeButtons from '../components/riskOfficer/TradeButtons';
import TradeTimeline from '../components/riskOfficer/TradeTimeline';
import SevereWarningModal from '../components/riskOfficer/SevereWarningModal';
import './RiskOfficer.css';

export default function RiskOfficer() {
  const {
    state,
    lotInfo,
    profitMetrics,
    traderState,
    warnings,
    sessionStatus,
    tradingDisabled,
    recordWin,
    recordLoss,
    resetDay,
    setStartingBalance,
    maxTrades,
    maxLosses,
  } = useRiskOfficer();

  const [showReset, setShowReset] = useState(false);
  const [resetBalance, setResetBalance] = useState('');
  const [showSetup, setShowSetup] = useState(state.startingBalance === 38 && state.trades.length === 0);
  const [showStatGrid, setShowStatGrid] = useState(false);
  const criticalWarnings = warnings.filter((w) => w.level === 'critical' || w.level === 'danger');

  const handleReset = () => {
    resetDay(resetBalance);
    setShowReset(false);
    setResetBalance('');
  };

  const handleSetup = () => {
    setStartingBalance(resetBalance || state.startingBalance);
    setShowSetup(false);
    setResetBalance('');
  };

  return (
    <div className="risk-officer">
      <header className="ro-header">
        <div>
          <h1>🧠 Risk Officer</h1>
          <p>Behavioral trading co-pilot — protect profits, prevent emotional trading.</p>
        </div>
        <div className="ro-header-actions">
          <button className="ro-btn-secondary" onClick={() => setShowSetup(true)}>
            Set Balance
          </button>
          <button className="ro-btn-secondary" onClick={() => setShowReset(true)}>
            Reset Day
          </button>
        </div>
      </header>

      <div className="ro-split">
        <aside className="ro-split-left">
          <EquityCurve
            startingBalance={state.startingBalance}
            peakBalance={state.peakBalance}
            currentBalance={state.currentBalance}
            trades={state.trades}
          />
        </aside>

        <div className="ro-split-right">
          <div className="ro-top-actions">
            <TradeButtons
              tradingDisabled={tradingDisabled}
              onWin={recordWin}
              onLoss={recordLoss}
              tradeCount={state.tradeCount}
              maxTrades={maxTrades}
              lossStreak={state.lossStreak}
              maxLosses={maxLosses}
            />

            <RecommendationPanel
              state={state}
              lotInfo={lotInfo}
              tradingDisabled={tradingDisabled}
            />
          </div>

          <StateBanner state={traderState} sessionStatus={sessionStatus} />

          <WarningCards warnings={warnings} />

          <StatGrid
            state={state}
            profitMetrics={profitMetrics}
            traderState={traderState}
            sessionStatus={sessionStatus}
            maxTrades={maxTrades}
            maxLosses={maxLosses}
          />

          <TradeTimeline trades={state.trades} />
        </div>
      </div>

      {criticalWarnings.length > 0 && (
        <SevereWarningModal warnings={criticalWarnings} />
      )}

      {showReset && (
        <div className="ro-modal-overlay" onClick={() => setShowReset(false)}>
          <div className="ro-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reset Day</h2>
            <p>Start a fresh session. Optionally set a new starting balance.</p>
            <input
              type="number"
              placeholder={`Current: $${state.currentBalance}`}
              value={resetBalance}
              onChange={(e) => setResetBalance(e.target.value)}
            />
            <div className="ro-modal-actions">
              <button className="ro-btn-secondary" onClick={() => setShowReset(false)}>
                Cancel
              </button>
              <button className="ro-btn-primary" onClick={handleReset}>
                Reset Day
              </button>
            </div>
          </div>
        </div>
      )}

      {showSetup && (
        <div className="ro-modal-overlay" onClick={() => setShowSetup(false)}>
          <div className="ro-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Set Starting Balance</h2>
            <p>Enter your account balance to begin today's session.</p>
            <input
              type="number"
              placeholder="e.g. 38"
              value={resetBalance}
              onChange={(e) => setResetBalance(e.target.value)}
              autoFocus
            />
            <div className="ro-modal-actions">
              <button className="ro-btn-secondary" onClick={() => setShowSetup(false)}>
                Cancel
              </button>
              <button className="ro-btn-primary" onClick={handleSetup}>
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
