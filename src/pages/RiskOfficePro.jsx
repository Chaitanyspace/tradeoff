import { useRiskOfficePro } from '../hooks/useRiskOfficePro';
import ProSetupForm from '../components/riskOfficePro/ProSetupForm';
import GlowingStatePanel, { GlowingLotSuggestion } from '../components/riskOfficePro/GlowingPanels';
import ProTradeButtons, { ProSessionBar } from '../components/riskOfficePro/ProTradeButtons';
import EquityCurve from '../components/riskOfficer/EquityCurve';
import TradeTimeline from '../components/riskOfficer/TradeTimeline';
import './RiskOfficePro.css';

export default function RiskOfficePro() {
  const {
    state,
    lotInfo,
    profitMetrics,
    traderState,
    alerts,
    tradingDisabled,
    configureSession,
    recordWin,
    recordLoss,
    resetSession,
    maxTrades,
    maxLosses,
  } = useRiskOfficePro();

  if (!state.isConfigured) {
    return (
      <div className="risk-office-pro">
        <ProSetupForm onStart={configureSession} />
      </div>
    );
  }

  const lockMessage =
    state.tradeCount >= maxTrades
      ? 'SESSION COMPLETE — Quality over quantity.'
      : state.lossStreak >= maxLosses
        ? 'SESSION OVER — Close the PC. Protect your account.'
        : 'TRADING STOPPED';

  return (
    <div className={`risk-office-pro ${tradingDisabled ? 'risk-office-pro--locked' : ''}`}>
      <div className="pro-blur-layer">
        <ProSessionBar
          state={state}
          profileId={state.aggressionProfile}
          profitMetrics={profitMetrics}
          onReset={resetSession}
        />

        <div className="pro-layout">
          <aside className="pro-layout-left">
            <EquityCurve
              startingBalance={state.startingBalance}
              peakBalance={state.peakBalance}
              currentBalance={state.currentBalance}
              trades={state.trades}
            />
          </aside>

          <div className="pro-layout-right">
            {!tradingDisabled && (
              <>
                <GlowingLotSuggestion
                  lotInfo={lotInfo}
                  profileId={state.aggressionProfile}
                  tradingDisabled={false}
                />
                <GlowingStatePanel traderState={traderState} alerts={alerts} />
              </>
            )}

            <ProTradeButtons
              tradingDisabled={tradingDisabled}
              onWin={recordWin}
              onLoss={recordLoss}
              tradeCount={state.tradeCount}
              maxTrades={maxTrades}
              lossStreak={state.lossStreak}
              maxLosses={maxLosses}
            />

            <div className="pro-quick-stats">
              <div className="pro-quick-stat">
                <span>Start</span>
                <strong>${state.startingBalance.toFixed(2)}</strong>
              </div>
              <div className="pro-quick-stat">
                <span>Profit Made</span>
                <strong className="positive">${profitMetrics.profitMade.toFixed(2)}</strong>
              </div>
              <div className="pro-quick-stat">
                <span>Given Back</span>
                <strong className="negative">${profitMetrics.profitGivenBack.toFixed(2)}</strong>
              </div>
              <div className="pro-quick-stat">
                <span>Win Streak</span>
                <strong>{state.winStreak}</strong>
              </div>
            </div>

            <TradeTimeline trades={state.trades} />
          </div>
        </div>
      </div>

      {tradingDisabled && (
        <div className="pro-lock-overlay" aria-live="polite">
          <div className="pro-lock-focus">
            <GlowingLotSuggestion
              lotInfo={lotInfo}
              profileId={state.aggressionProfile}
              tradingDisabled
              lockMessage={lockMessage}
            />
            <GlowingStatePanel traderState={traderState} alerts={alerts} />
            <div className="pro-lock-banner">{lockMessage}</div>
            <button type="button" className="pro-lock-reset" onClick={resetSession}>
              Start New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
