export function getProfitMetrics(startingBalance, peakBalance, currentBalance) {
  const profitMade = Math.max(0, peakBalance - startingBalance);
  const profitGivenBack = Math.max(0, peakBalance - currentBalance);
  const givebackPercentage =
    profitMade > 0 ? Math.round((profitGivenBack / profitMade) * 100) : 0;

  return { profitMade, profitGivenBack, givebackPercentage };
}

export function getGivebackWarning(givebackPercentage) {
  if (givebackPercentage >= 60) {
    return {
      level: 'critical',
      title: 'ACCOUNT DESTRUCTION MODE',
      message: 'Walk away.',
      icon: '🚨',
    };
  }
  if (givebackPercentage >= 40) {
    return {
      level: 'danger',
      title: 'YOU ARE GIVING BACK PROFITS',
      message: 'Stop chasing your peak. Protect what remains.',
      icon: '🚨',
    };
  }
  if (givebackPercentage >= 20) {
    return {
      level: 'warning',
      title: 'GIVING BACK PROFITS',
      message: 'Protect today\'s gains. Do not increase size.',
      icon: '⚠',
    };
  }
  return null;
}

export function getShrinkWarning(peakBalance, currentBalance) {
  if (peakBalance <= 0) return null;
  const shrinkRatio = currentBalance / peakBalance;

  if (shrinkRatio <= 0.4) {
    return {
      level: 'critical',
      title: 'YOU ARE GETTING YOURSELF TO ZERO',
      message:
        'Continuing like this will likely cause another deposit. Protect what remains. Walk away.',
      icon: '🚨',
    };
  }
  if (shrinkRatio <= 0.55) {
    return {
      level: 'danger',
      title: 'DANGER',
      message: 'You are approaching another deposit cycle.',
      icon: '🚨',
    };
  }
  if (shrinkRatio <= 0.7) {
    return {
      level: 'warning',
      title: 'ACCOUNT SHRINKING',
      message: 'Reduce aggression.',
      icon: '⚠',
    };
  }
  return null;
}
