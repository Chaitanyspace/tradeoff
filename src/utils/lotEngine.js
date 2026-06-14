const LOT_TIERS = [
  { min: 200, lot: 6 },
  { min: 150, lot: 4 },
  { min: 130, lot: 3 },
  { min: 60, lot: 2 },
  { min: 0, lot: 1 },
];

export function getBaseLot(balance) {
  const tier = LOT_TIERS.find((t) => balance >= t.min);
  return tier ? tier.lot : 1;
}

export function getLotAdjustment(lossStreak) {
  switch (lossStreak) {
    case 0:
      return { offset: 0, reason: 'Normal lot size.', aPlusOnly: false, sessionOver: false };
    case 1:
      return { offset: -1, reason: 'One loss — reduce one level.', aPlusOnly: false, sessionOver: false };
    case 2:
      return { offset: -Infinity, reason: 'Capital preservation mode.', aPlusOnly: false, sessionOver: false };
    case 3:
      return { offset: -Infinity, reason: 'Only A+ setups allowed.', aPlusOnly: true, sessionOver: false };
    case 4:
    default:
      return { offset: -Infinity, reason: 'Session over — four consecutive losses.', aPlusOnly: true, sessionOver: true };
  }
}

export function getRecommendedLot(balance, lossStreak) {
  const baseLot = getBaseLot(balance);
  const adjustment = getLotAdjustment(lossStreak);

  if (adjustment.sessionOver) {
    return {
      baseLot,
      recommendedLot: 0,
      lossStreak,
      reason: adjustment.reason,
      aPlusOnly: adjustment.aPlusOnly,
      sessionOver: true,
    };
  }

  if (adjustment.offset === -Infinity) {
    return {
      baseLot,
      recommendedLot: 1,
      lossStreak,
      reason: adjustment.reason,
      aPlusOnly: adjustment.aPlusOnly,
      sessionOver: false,
    };
  }

  const recommendedLot = Math.max(1, baseLot + adjustment.offset);

  return {
    baseLot,
    recommendedLot,
    lossStreak,
    reason: adjustment.reason,
    aPlusOnly: adjustment.aPlusOnly,
    sessionOver: false,
  };
}

export const MAX_TRADES_PER_DAY = 7;
export const MAX_CONSECUTIVE_LOSSES = 4;
export const WIN_MULTIPLIER = 0.9;
