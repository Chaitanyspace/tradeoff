import { getProfitMetrics } from './giveback';

export const PRO_STATES = {
  IN_CONTROL: {
    id: 'IN_CONTROL',
    label: 'IN CONTROL',
    message: 'You are trading within your risk envelope. Stay patient.',
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.55)',
    severity: 0,
  },
  STAY_DISCIPLINED: {
    id: 'STAY_DISCIPLINED',
    label: 'STAY DISCIPLINED',
    message: 'Small giveback detected. Do not increase size.',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.5)',
    severity: 1,
  },
  GIVING_BACK: {
    id: 'GIVING_BACK',
    label: 'GIVING BACK PROFITS',
    message: 'You are returning gains to the market. Protect what is left.',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.55)',
    severity: 2,
  },
  LOSING_STREAK: {
    id: 'LOSING_STREAK',
    label: 'LOSING CONTINUOUSLY',
    message: 'Multiple losses in a row. Slow down — revenge trading is near.',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.6)',
    severity: 3,
  },
  HEAVY_DRAWDOWN: {
    id: 'HEAVY_DRAWDOWN',
    label: 'WAY TOO MUCH LOSING',
    message: 'Account is bleeding. Reduce to minimum or walk away.',
    color: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.6)',
    severity: 4,
  },
  CLOSE_NOW: {
    id: 'CLOSE_NOW',
    label: 'CLOSE THE PLATFORM',
    message: 'You will blow this account if you continue. Stop now. Tomorrow is another day.',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.75)',
    severity: 5,
  },
};

export function getProTraderState({
  startingBalance,
  peakBalance,
  currentBalance,
  lossStreak,
  tradingDisabled,
  disableReason,
}) {
  if (tradingDisabled && disableReason === 'max_losses') {
    return PRO_STATES.CLOSE_NOW;
  }

  const { givebackPercentage } = getProfitMetrics(startingBalance, peakBalance, currentBalance);
  const shrinkRatio = peakBalance > 0 ? currentBalance / peakBalance : 1;
  const drawdownFromStart = startingBalance > 0
    ? (startingBalance - currentBalance) / startingBalance
    : 0;

  if (
    lossStreak >= 4 ||
    givebackPercentage >= 70 ||
    shrinkRatio <= 0.35 ||
    drawdownFromStart >= 0.45
  ) {
    return PRO_STATES.CLOSE_NOW;
  }

  if (
    lossStreak >= 3 ||
    givebackPercentage >= 50 ||
    shrinkRatio <= 0.5 ||
    drawdownFromStart >= 0.3
  ) {
    return PRO_STATES.HEAVY_DRAWDOWN;
  }

  if (lossStreak >= 2) {
    return PRO_STATES.LOSING_STREAK;
  }

  if (givebackPercentage >= 25 || (peakBalance > startingBalance && currentBalance < peakBalance * 0.85)) {
    return PRO_STATES.GIVING_BACK;
  }

  if (givebackPercentage >= 10 || lossStreak === 1) {
    return PRO_STATES.STAY_DISCIPLINED;
  }

  return PRO_STATES.IN_CONTROL;
}

export function getProAlerts(state, lossStreak, givebackPct, currentBalance, startingBalance) {
  const alerts = [];

  if (state.severity >= 4) {
    alerts.push({
      text: 'CLOSE IT — YOU ARE ABOUT TO BLOW THE ACCOUNT',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.8)',
      pulse: true,
    });
  }

  if (lossStreak >= 2) {
    alerts.push({
      text: `LOSING STREAK: ${lossStreak} IN A ROW`,
      color: '#f97316',
      glow: 'rgba(249, 115, 22, 0.6)',
      pulse: lossStreak >= 3,
    });
  }

  if (givebackPct >= 40) {
    alerts.push({
      text: 'STOP CHASING YOUR PEAK BALANCE',
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.55)',
      pulse: false,
    });
  }

  if (currentBalance <= startingBalance * 0.9 && startingBalance > 0) {
    alerts.push({
      text: 'BELOW START — DEFEND CAPITAL',
      color: '#fb7185',
      glow: 'rgba(251, 113, 133, 0.5)',
      pulse: false,
    });
  }

  return alerts;
}
