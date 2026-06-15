export const AGGRESSION_PROFILES = {
  safestAggressive: {
    id: 'safestAggressive',
    label: 'Safest Aggressive',
    tagline: 'Floor of your range',
    description: 'Lowest end of your intuitive band. Protect the account first.',
    slot: 'min',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.45)',
  },
  safeAggressive: {
    id: 'safeAggressive',
    label: 'Safe Aggressive',
    tagline: 'Middle of your range',
    description: 'Balanced sizing — your default comfort zone.',
    slot: 'mid',
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.45)',
  },
  lowAggressive: {
    id: 'lowAggressive',
    label: 'Low Aggressive',
    tagline: 'Ceiling of your range',
    description: 'Top of your band. Still controlled — never oversized.',
    slot: 'max',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.45)',
  },
};

/** Balance bands based on your intuitive risk sizing */
const BALANCE_LOT_BANDS = [
  { min: 200, minLot: 6, maxLot: 8 },
  { min: 120, minLot: 5, maxLot: 6 },
  { min: 60, minLot: 3, maxLot: 5 },
  { min: 30, minLot: 2, maxLot: 3 },
  { min: 0, minLot: 1, maxLot: 2 },
];

export function getBalanceBand(balance) {
  const band = BALANCE_LOT_BANDS.find((b) => balance >= b.min) || BALANCE_LOT_BANDS[BALANCE_LOT_BANDS.length - 1];
  const mid = Math.round((band.minLot + band.maxLot) / 2);
  return {
    ...band,
    midLot: mid,
    rangeLabel: `$${band.minLot}–$${band.maxLot}`,
  };
}

function pickLotFromBand(band, slot) {
  switch (slot) {
    case 'min':
      return band.minLot;
    case 'max':
      return band.maxLot;
    case 'mid':
    default:
      return band.midLot;
  }
}

export function getProfileLot(balance, profileId, lossStreak) {
  const profile = AGGRESSION_PROFILES[profileId] || AGGRESSION_PROFILES.safeAggressive;
  const band = getBalanceBand(balance);
  let lot = pickLotFromBand(band, profile.slot);

  let reason = `${profile.label} — ${band.rangeLabel} band at $${Math.round(balance)}.`;
  let aPlusOnly = false;
  let sessionOver = false;

  if (lossStreak >= PRO_MAX_LOSSES) {
    return {
      recommendedLot: 0,
      baseLot: lot,
      profileLot: lot,
      band,
      rangeLabel: band.rangeLabel,
      reason: 'Session over — four consecutive losses. Close the platform.',
      aPlusOnly: true,
      sessionOver: true,
    };
  }

  if (lossStreak === 3) {
    lot = band.minLot;
    aPlusOnly = true;
    reason = `Three losses — drop to $${band.minLot} (band floor). A+ setups or stop.`;
  } else if (lossStreak === 2) {
    lot = band.minLot;
    reason = `Two losses in a row — minimum $${band.minLot} for this balance.`;
  } else if (lossStreak === 1) {
    lot = Math.max(band.minLot, lot - 1);
    reason = `One loss — step down to $${lot}.`;
  }

  lot = Math.max(band.minLot, Math.min(lot, band.maxLot));

  return {
    recommendedLot: lot,
    baseLot: pickLotFromBand(band, profile.slot),
    profileLot: pickLotFromBand(band, profile.slot),
    band,
    rangeLabel: band.rangeLabel,
    reason,
    aPlusOnly,
    sessionOver: false,
  };
}

export function previewProfileLots(balance) {
  const band = getBalanceBand(balance);
  return Object.values(AGGRESSION_PROFILES).map((profile) => {
    const info = getProfileLot(balance, profile.id, 0);
    return {
      ...profile,
      previewLot: info.recommendedLot,
      rangeLabel: band.rangeLabel,
      bandMin: band.minLot,
      bandMax: band.maxLot,
    };
  });
}

export const PRO_MAX_LOSSES = 4;
export const PRO_DEFAULT_MAX_TRADES = 7;
export const PRO_WIN_MULTIPLIER = 0.9;
