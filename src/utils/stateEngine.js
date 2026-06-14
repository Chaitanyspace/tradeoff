import { getProfitMetrics } from './giveback';
import { MAX_CONSECUTIVE_LOSSES } from './lotEngine';

export const TRADER_STATES = {
  FLOW: {
    id: 'FLOW',
    label: 'FLOW',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    message: 'Trading normally. No danger detected.',
  },
  GREED: {
    id: 'GREED',
    label: 'GREED',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    message: 'Protect gains. Do not increase size.',
  },
  REVENGE: {
    id: 'REVENGE',
    label: 'REVENGE',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    message: 'Reduce frequency. Take only A+ setups.',
  },
  ACCOUNT_DESTRUCTION: {
    id: 'ACCOUNT_DESTRUCTION',
    label: 'ACCOUNT DESTRUCTION',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    message: 'Walk away. Protect capital.',
  },
};

export function getTraderState({
  startingBalance,
  peakBalance,
  currentBalance,
  lossStreak,
  tradingDisabled,
  disableReason,
}) {
  if (tradingDisabled) {
    if (disableReason === 'max_losses') {
      return TRADER_STATES.ACCOUNT_DESTRUCTION;
    }
    if (disableReason === 'max_trades') {
      return TRADER_STATES.FLOW;
    }
  }

  const { givebackPercentage } = getProfitMetrics(
    startingBalance,
    peakBalance,
    currentBalance
  );

  const shrinkRatio = peakBalance > 0 ? currentBalance / peakBalance : 1;

  if (
    lossStreak >= MAX_CONSECUTIVE_LOSSES ||
    givebackPercentage >= 60 ||
    shrinkRatio <= 0.4
  ) {
    return TRADER_STATES.ACCOUNT_DESTRUCTION;
  }

  if (lossStreak >= 2) {
    return TRADER_STATES.REVENGE;
  }

  if (givebackPercentage >= 20 || (peakBalance > startingBalance && currentBalance < peakBalance)) {
    return TRADER_STATES.GREED;
  }

  return TRADER_STATES.FLOW;
}

export function getActiveWarnings(state, givebackWarning, shrinkWarning, lossStreak, tradingDisabled, disableReason) {
  const warnings = [];

  if (givebackWarning) warnings.push(givebackWarning);
  if (shrinkWarning) warnings.push(shrinkWarning);

  if (state.id === 'REVENGE' && lossStreak >= 2) {
    warnings.push({
      level: 'danger',
      title: 'REVENGE TRADING DETECTED',
      message: 'Slow down. Take only A+ setups.',
      icon: '🚨',
    });
  }

  if (tradingDisabled && disableReason === 'max_losses') {
    warnings.push({
      level: 'critical',
      title: 'SESSION OVER',
      message: 'Close the PC. Tomorrow is another day.',
      icon: '🛑',
    });
  }

  if (tradingDisabled && disableReason === 'max_trades') {
    warnings.push({
      level: 'info',
      title: 'SESSION COMPLETE',
      message: 'Quality > Quantity',
      icon: '✓',
    });
  }

  const seen = new Set();
  return warnings.filter((w) => {
    if (seen.has(w.title)) return false;
    seen.add(w.title);
    return true;
  });
}
