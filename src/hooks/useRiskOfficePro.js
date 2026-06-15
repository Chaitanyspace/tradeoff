import { useState, useCallback, useMemo } from 'react';
import {
  getProfileLot,
  PRO_MAX_LOSSES,
  PRO_DEFAULT_MAX_TRADES,
  PRO_WIN_MULTIPLIER,
} from '../utils/proLotEngine';
import { getProfitMetrics } from '../utils/giveback';
import { getProTraderState, getProAlerts } from '../utils/proStateEngine';
import {
  loadDb,
  saveDb,
  getDefaultRiskOfficeProState,
  getTodayKey,
} from '../utils/storage';

const PROFILE_MIGRATION = {
  safest: 'safestAggressive',
  safe: 'safeAggressive',
};

function normalizeProState(state) {
  const profile = PROFILE_MIGRATION[state.aggressionProfile] || state.aggressionProfile;
  return {
    ...state,
    aggressionProfile: profile,
    maxTrades: state.maxTrades || PRO_DEFAULT_MAX_TRADES,
  };
}

function ensureProSession(state) {
  state = normalizeProState(state);
  const today = getTodayKey();
  if (state.sessionDate !== today && state.isConfigured) {
    return {
      ...getDefaultRiskOfficeProState(state.currentBalance),
      startingBalance: state.currentBalance,
      currentBalance: state.currentBalance,
      peakBalance: state.currentBalance,
      aggressionProfile: state.aggressionProfile,
      maxTrades: state.maxTrades || PRO_DEFAULT_MAX_TRADES,
      isConfigured: true,
    };
  }
  return {
    ...state,
    maxTrades: state.maxTrades || PRO_DEFAULT_MAX_TRADES,
  };
}

export function useRiskOfficePro() {
  const [db, setDb] = useState(() => {
    const loaded = loadDb();
    return {
      ...loaded,
      riskOfficePro: ensureProSession(loaded.riskOfficePro || getDefaultRiskOfficeProState()),
    };
  });

  const persist = useCallback((nextDb) => {
    setDb(nextDb);
    saveDb(nextDb);
  }, []);

  const pro = db.riskOfficePro;
  const maxTrades = pro.maxTrades || PRO_DEFAULT_MAX_TRADES;

  const lotInfo = useMemo(() => {
    if (!pro.isConfigured || !pro.aggressionProfile) {
      return null;
    }
    return getProfileLot(pro.currentBalance, pro.aggressionProfile, pro.lossStreak);
  }, [pro.currentBalance, pro.aggressionProfile, pro.lossStreak, pro.isConfigured]);

  const profitMetrics = useMemo(
    () =>
      pro.isConfigured
        ? getProfitMetrics(pro.startingBalance, pro.peakBalance, pro.currentBalance)
        : { profitMade: 0, profitGivenBack: 0, givebackPercentage: 0 },
    [pro.startingBalance, pro.peakBalance, pro.currentBalance, pro.isConfigured]
  );

  const traderState = useMemo(() => {
    if (!pro.isConfigured) return null;
    return getProTraderState({
      startingBalance: pro.startingBalance,
      peakBalance: pro.peakBalance,
      currentBalance: pro.currentBalance,
      lossStreak: pro.lossStreak,
      tradingDisabled: pro.tradingDisabled,
      disableReason: pro.disableReason,
    });
  }, [pro]);

  const alerts = useMemo(() => {
    if (!pro.isConfigured || !traderState) return [];
    return getProAlerts(
      traderState,
      pro.lossStreak,
      profitMetrics.givebackPercentage,
      pro.currentBalance,
      pro.startingBalance
    );
  }, [pro, traderState, profitMetrics.givebackPercentage]);

  const tradingDisabled =
    pro.tradingDisabled ||
    pro.tradeCount >= maxTrades ||
    pro.lossStreak >= PRO_MAX_LOSSES;

  const configureSession = useCallback(
    (balance, aggressionProfile, maxTradesInput) => {
      const num = Number(balance);
      const trades = Number(maxTradesInput);
      if (isNaN(num) || num <= 0 || !aggressionProfile) return;
      if (isNaN(trades) || trades < 1 || trades > 50) return;

      persist({
        ...db,
        riskOfficePro: {
          ...getDefaultRiskOfficeProState(num),
          aggressionProfile,
          maxTrades: trades,
          isConfigured: true,
        },
      });
    },
    [db, persist]
  );

  const recordTrade = useCallback(
    (result) => {
      if (!pro.isConfigured || tradingDisabled || !lotInfo) return;

      const lot = lotInfo.recommendedLot;
      if (lot <= 0) return;

      const isWin = result === 'WIN';
      const pnl = isWin ? lot * PRO_WIN_MULTIPLIER : -lot;
      const newBalance = Math.round((pro.currentBalance + pnl) * 100) / 100;
      const newLossStreak = isWin ? 0 : pro.lossStreak + 1;
      const newWinStreak = isWin ? pro.winStreak + 1 : 0;
      const newTradeCount = pro.tradeCount + 1;
      const newPeak = Math.max(pro.peakBalance, newBalance);

      const nextState = {
        ...pro,
        currentBalance: newBalance,
        peakBalance: newPeak,
        lossStreak: newLossStreak,
        winStreak: newWinStreak,
        tradeCount: newTradeCount,
      };

      const stateAtTrade = getProTraderState({
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

      if (newTradeCount >= maxTrades) {
        tradingDisabledAfter = true;
        disableReason = 'max_trades';
      } else if (newLossStreak >= PRO_MAX_LOSSES) {
        tradingDisabledAfter = true;
        disableReason = 'max_losses';
      }

      persist({
        ...db,
        riskOfficePro: {
          ...nextState,
          trades: [...pro.trades, trade],
          tradingDisabled: tradingDisabledAfter,
          disableReason,
        },
      });
    },
    [db, pro, lotInfo, tradingDisabled, maxTrades, persist]
  );

  const resetSession = useCallback(() => {
    persist({
      ...db,
      riskOfficePro: getDefaultRiskOfficeProState(),
    });
  }, [db, persist]);

  return {
    state: pro,
    lotInfo,
    profitMetrics,
    traderState,
    alerts,
    tradingDisabled,
    configureSession,
    recordWin: () => recordTrade('WIN'),
    recordLoss: () => recordTrade('LOSS'),
    resetSession,
    maxTrades,
    maxLosses: PRO_MAX_LOSSES,
  };
}
