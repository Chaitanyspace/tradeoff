import { useState, useCallback, useMemo } from 'react';
import {
  getRecommendedLot,
  MAX_TRADES_PER_DAY,
  MAX_CONSECUTIVE_LOSSES,
  WIN_MULTIPLIER,
} from '../utils/lotEngine';
import { getProfitMetrics, getGivebackWarning, getShrinkWarning } from '../utils/giveback';
import { getTraderState, getActiveWarnings } from '../utils/stateEngine';
import { loadDb, saveDb, getDefaultRiskOfficerState, getTodayKey } from '../utils/storage';

function ensureSessionDate(state) {
  const today = getTodayKey();
  if (state.sessionDate !== today) {
    return getDefaultRiskOfficerState(state.startingBalance);
  }
  return state;
}

export function useRiskOfficer() {
  const [db, setDb] = useState(() => {
    const loaded = loadDb();
    return {
      ...loaded,
      riskOfficer: ensureSessionDate(loaded.riskOfficer),
    };
  });

  const persist = useCallback((nextDb) => {
    setDb(nextDb);
    saveDb(nextDb);
  }, []);

  const ro = db.riskOfficer;

  const lotInfo = useMemo(
    () => getRecommendedLot(ro.currentBalance, ro.lossStreak),
    [ro.currentBalance, ro.lossStreak]
  );

  const profitMetrics = useMemo(
    () => getProfitMetrics(ro.startingBalance, ro.peakBalance, ro.currentBalance),
    [ro.startingBalance, ro.peakBalance, ro.currentBalance]
  );

  const traderState = useMemo(
    () =>
      getTraderState({
        startingBalance: ro.startingBalance,
        peakBalance: ro.peakBalance,
        currentBalance: ro.currentBalance,
        lossStreak: ro.lossStreak,
        tradingDisabled: ro.tradingDisabled,
        disableReason: ro.disableReason,
      }),
    [ro]
  );

  const givebackWarning = useMemo(
    () => getGivebackWarning(profitMetrics.givebackPercentage),
    [profitMetrics.givebackPercentage]
  );

  const shrinkWarning = useMemo(
    () => getShrinkWarning(ro.peakBalance, ro.currentBalance),
    [ro.peakBalance, ro.currentBalance]
  );

  const warnings = useMemo(
    () =>
      getActiveWarnings(
        traderState,
        givebackWarning,
        shrinkWarning,
        ro.lossStreak,
        ro.tradingDisabled,
        ro.disableReason
      ),
    [traderState, givebackWarning, shrinkWarning, ro.lossStreak, ro.tradingDisabled, ro.disableReason]
  );

  const tradingDisabled =
    ro.tradingDisabled ||
    ro.tradeCount >= MAX_TRADES_PER_DAY ||
    ro.lossStreak >= MAX_CONSECUTIVE_LOSSES;

  const sessionStatus = useMemo(() => {
    if (ro.tradingDisabled && ro.disableReason === 'max_losses') {
      return { label: 'SESSION OVER', color: '#ef4444' };
    }
    if (ro.tradingDisabled && ro.disableReason === 'max_trades') {
      return { label: 'SESSION COMPLETE', color: '#22c55e' };
    }
    if (ro.lossStreak >= 3) {
      return { label: 'HIGH RISK', color: '#f97316' };
    }
    if (traderState.id === 'GREED') {
      return { label: 'PROTECT GAINS', color: '#eab308' };
    }
    return { label: 'ACTIVE', color: '#22c55e' };
  }, [ro, traderState, tradingDisabled]);

  const recordTrade = useCallback(
    (result) => {
      if (tradingDisabled) return;

      const lot = lotInfo.recommendedLot;
      const isWin = result === 'WIN';
      const pnl = isWin ? lot * WIN_MULTIPLIER : -lot;
      const newBalance = Math.round((ro.currentBalance + pnl) * 100) / 100;
      const newLossStreak = isWin ? 0 : ro.lossStreak + 1;
      const newTradeCount = ro.tradeCount + 1;
      const newPeak = Math.max(ro.peakBalance, newBalance);

      const nextState = {
        ...ro,
        currentBalance: newBalance,
        peakBalance: newPeak,
        lossStreak: newLossStreak,
        tradeCount: newTradeCount,
      };

      const stateAtTrade = getTraderState({
        ...nextState,
        tradingDisabled: false,
        disableReason: null,
      });

      const trade = {
        tradeNumber: newTradeCount,
        result: isWin ? 'WIN' : 'LOSS',
        balanceAfter: newBalance,
        traderState: stateAtTrade.id,
        lotSize: lot,
        timestamp: new Date().toISOString(),
      };

      let tradingDisabledAfter = false;
      let disableReason = null;

      if (newTradeCount >= MAX_TRADES_PER_DAY) {
        tradingDisabledAfter = true;
        disableReason = 'max_trades';
      } else if (newLossStreak >= MAX_CONSECUTIVE_LOSSES) {
        tradingDisabledAfter = true;
        disableReason = 'max_losses';
      }

      persist({
        ...db,
        riskOfficer: {
          ...nextState,
          trades: [...ro.trades, trade],
          tradingDisabled: tradingDisabledAfter,
          disableReason,
        },
      });
    },
    [db, ro, lotInfo, tradingDisabled, persist]
  );

  const resetDay = useCallback(
    (newStartingBalance) => {
      const balance =
        newStartingBalance !== undefined && newStartingBalance !== ''
          ? Number(newStartingBalance)
          : ro.currentBalance;

      persist({
        ...db,
        riskOfficer: getDefaultRiskOfficerState(balance),
      });
    },
    [db, ro.currentBalance, persist]
  );

  const setStartingBalance = useCallback(
    (balance) => {
      const num = Number(balance);
      if (isNaN(num) || num <= 0) return;
      persist({
        ...db,
        riskOfficer: {
          ...getDefaultRiskOfficerState(num),
        },
      });
    },
    [db, persist]
  );

  return {
    state: ro,
    lotInfo,
    profitMetrics,
    traderState,
    warnings,
    sessionStatus,
    tradingDisabled,
    recordWin: () => recordTrade('WIN'),
    recordLoss: () => recordTrade('LOSS'),
    resetDay,
    setStartingBalance,
    maxTrades: MAX_TRADES_PER_DAY,
    maxLosses: MAX_CONSECUTIVE_LOSSES,
  };
}
