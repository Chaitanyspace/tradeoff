/** Dynamic risk anchors — bands interpolate smoothly as balance changes */
const RISK_ANCHORS = [
  { balance: 30, minLot: 1, maxLot: 2 },
  { balance: 60, minLot: 3, maxLot: 5 },
  { balance: 100, minLot: 5, maxLot: 6 },
  { balance: 115, minLot: 6, maxLot: 7 },
  { balance: 130, minLot: 6, maxLot: 7 },
  { balance: 150, minLot: 7, maxLot: 9 },
  { balance: 200, minLot: 8, maxLot: 10 },
  { balance: 250, minLot: 8, maxLot: 11 },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateAt(balance, key) {
  if (balance <= RISK_ANCHORS[0].balance) return RISK_ANCHORS[0][key];
  const last = RISK_ANCHORS[RISK_ANCHORS.length - 1];
  if (balance >= last.balance) return last[key];

  for (let i = 0; i < RISK_ANCHORS.length - 1; i++) {
    const a = RISK_ANCHORS[i];
    const b = RISK_ANCHORS[i + 1];
    if (balance >= a.balance && balance <= b.balance) {
      const t = (balance - a.balance) / (b.balance - a.balance);
      return Math.round(lerp(a[key], b[key], t));
    }
  }
  return RISK_ANCHORS[0][key];
}

export const AGGRESSION_PROFILES = {
  lowestRisk: {
    id: 'lowestRisk',
    label: 'Lowest Risk',
    tagline: 'Absolute minimum',
    description: 'Floor of your live band. Best when recovering or unsure.',
    slot: 0,
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.5)',
  },
  lowRisk: {
    id: 'lowRisk',
    label: 'Low Risk',
    tagline: 'Conservative step',
    description: 'One step above minimum. Slow and steady.',
    slot: 0.25,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
  safe: {
    id: 'safe',
    label: 'Safe',
    tagline: 'Middle of your band',
    description: 'Your default comfort zone at this balance.',
    slot: 0.5,
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.45)',
  },
  lowAggressive: {
    id: 'lowAggressive',
    label: 'Low Aggressive',
    tagline: 'Upper band',
    description: 'Top end of your range — still controlled.',
    slot: 0.75,
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.45)',
  },
  highRisk: {
    id: 'highRisk',
    label: 'High Risk',
    tagline: 'Band ceiling',
    description: 'Maximum for this balance. Only when flowing.',
    slot: 1,
    color: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.5)',
  },
};

/** Legacy profile id migration */
export const PROFILE_ALIASES = {
  safest: 'lowestRisk',
  safestAggressive: 'lowestRisk',
  safeAggressive: 'safe',
};

export function getBalanceBand(balance) {
  const minLot = interpolateAt(balance, 'minLot');
  const maxLot = Math.max(minLot, interpolateAt(balance, 'maxLot'));
  const steps = [];
  for (let i = minLot; i <= maxLot; i++) steps.push(i);
  const midLot = steps[Math.floor(steps.length / 2)] ?? minLot;

  return {
    minLot,
    maxLot,
    midLot,
    steps,
    stepsLabel: steps.map((s) => `$${s}`).join(' · '),
    rangeLabel: `$${minLot}–$${maxLot}`,
    balance: Math.round(balance),
  };
}

function pickLotFromBand(band, slot) {
  if (band.minLot === band.maxLot) return band.minLot;
  const lot = Math.round(band.minLot + (band.maxLot - band.minLot) * slot);
  return Math.max(band.minLot, Math.min(band.maxLot, lot));
}

function resolveProfileId(profileId) {
  return PROFILE_ALIASES[profileId] || profileId;
}

export function getProfileLot(balance, profileId, lossStreak) {
  const resolvedId = resolveProfileId(profileId);
  const profile = AGGRESSION_PROFILES[resolvedId] || AGGRESSION_PROFILES.safe;
  const band = getBalanceBand(balance);
  let lot = pickLotFromBand(band, profile.slot);

  let reason = `${profile.label} at $${band.balance} — live band ${band.rangeLabel}.`;
  let aPlusOnly = false;
  let sessionOver = false;

  if (lossStreak >= PRO_MAX_LOSSES) {
    return {
      recommendedLot: 0,
      baseLot: lot,
      profileLot: lot,
      band,
      rangeLabel: band.rangeLabel,
      stepsLabel: band.stepsLabel,
      reason: 'Session over — four consecutive losses. Close the platform.',
      aPlusOnly: true,
      sessionOver: true,
    };
  }

  if (lossStreak === 3) {
    lot = band.minLot;
    aPlusOnly = true;
    reason = `Three losses — drop to $${band.minLot}. A+ setups or stop.`;
  } else if (lossStreak === 2) {
    lot = band.minLot;
    reason = `Two losses in a row — minimum $${band.minLot} at current balance.`;
  } else if (lossStreak === 1) {
    lot = Math.max(band.minLot, lot - 1);
    reason = `One loss — step down to $${lot}. Band shifts as balance moves.`;
  }

  lot = Math.max(band.minLot, Math.min(lot, band.maxLot));

  return {
    recommendedLot: lot,
    baseLot: pickLotFromBand(band, profile.slot),
    profileLot: pickLotFromBand(band, profile.slot),
    band,
    rangeLabel: band.rangeLabel,
    stepsLabel: band.stepsLabel,
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
      stepsLabel: band.stepsLabel,
      bandMin: band.minLot,
      bandMax: band.maxLot,
      bandSteps: band.steps,
    };
  });
}

export const PRO_MAX_LOSSES = 4;
export const PRO_DEFAULT_MAX_TRADES = 7;
export const PRO_WIN_MULTIPLIER = 0.9;
