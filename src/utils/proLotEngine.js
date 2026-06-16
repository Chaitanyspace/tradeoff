/**
 * Flexible risk bands — driven by CURRENT balance, not rigid tiers.
 *
 * Below $200: smooth curve through your known comfort zones.
 * Above $200: mild sub-linear growth (log scale) — account doubles,
 * risk does NOT double. e.g. $200 → $8–10, $400 → $10–15, $800 → $12–20.
 */

const ANCHORS = [
  { balance: 30, minLot: 1, maxLot: 2 },
  { balance: 60, minLot: 3, maxLot: 5 },
  { balance: 100, minLot: 5, maxLot: 6 },
  { balance: 115, minLot: 6, maxLot: 7 },
  { balance: 150, minLot: 7, maxLot: 9 },
  { balance: 200, minLot: 8, maxLot: 10 },
];

const MILD_GROWTH_BASE = 200;
const MILD_MIN_BASE = 8;
const MILD_MIN_GROWTH = 2;
const MILD_SPREAD_BASE = 2;
const MILD_SPREAD_GROWTH = 3;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateAnchors(balance) {
  if (balance <= ANCHORS[0].balance) {
    return { minLot: ANCHORS[0].minLot, maxLot: ANCHORS[0].maxLot };
  }

  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const a = ANCHORS[i];
    const b = ANCHORS[i + 1];
    if (balance >= a.balance && balance <= b.balance) {
      const t = (balance - a.balance) / (b.balance - a.balance);
      return {
        minLot: Math.round(lerp(a.minLot, b.minLot, t)),
        maxLot: Math.round(lerp(a.maxLot, b.maxLot, t)),
      };
    }
  }

  return {
    minLot: ANCHORS[ANCHORS.length - 1].minLot,
    maxLot: ANCHORS[ANCHORS.length - 1].maxLot,
  };
}

/** Mild log-scale growth above $200 — risk grows slower than the account */
function computeMildGrowth(balance) {
  const growth = Math.log2(balance / MILD_GROWTH_BASE);
  const minLot = Math.round(MILD_MIN_BASE + growth * MILD_MIN_GROWTH);
  const spread = Math.round(MILD_SPREAD_BASE + growth * MILD_SPREAD_GROWTH);
  const maxLot = minLot + Math.max(1, spread);

  const pctCap = Math.max(minLot + 1, Math.floor(balance * 0.05));
  return {
    minLot,
    maxLot: Math.min(maxLot, pctCap),
  };
}

function computeMinMaxLot(balance) {
  const bal = Math.max(0, balance);

  if (bal < 1) return { minLot: 1, maxLot: 1 };
  if (bal >= MILD_GROWTH_BASE) return computeMildGrowth(bal);
  return interpolateAnchors(bal);
}

/** Build human-readable step options (not always every dollar) */
function buildSteps(minLot, maxLot) {
  const span = maxLot - minLot;
  if (span === 0) return [minLot];
  if (span === 1) return [minLot, maxLot];
  if (span === 2) return [minLot, minLot + 1, maxLot];

  const picks = [
    minLot,
    Math.round(minLot + span * 0.33),
    Math.round(minLot + span * 0.55),
    Math.round(minLot + span * 0.78),
    maxLot,
  ];

  return [...new Set(picks.map((v) => Math.max(minLot, Math.min(maxLot, v))))].sort(
    (a, b) => a - b
  );
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

export const PROFILE_ALIASES = {
  safest: 'lowestRisk',
  safestAggressive: 'lowestRisk',
  safeAggressive: 'safe',
};

export function getBalanceBand(balance) {
  const { minLot, maxLot: rawMax } = computeMinMaxLot(balance);
  const maxLot = Math.max(minLot, rawMax);
  const steps = buildSteps(minLot, maxLot);
  const midLot = steps[Math.floor(steps.length / 2)] ?? minLot;

  return {
    minLot,
    maxLot,
    midLot,
    steps,
    stepsLabel: steps.map((s) => `$${s}`).join(' · '),
    rangeLabel: `$${minLot}–$${maxLot}`,
    balance: Math.round(balance * 100) / 100,
    growthMode: balance >= MILD_GROWTH_BASE ? 'mild' : 'standard',
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

  let reason = `${profile.label} — $${band.balance} balance → ${band.rangeLabel} band (live).`;
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
    reason = `Two losses in a row — minimum $${band.minLot} at $${band.balance}.`;
  } else if (lossStreak === 1) {
    lot = Math.max(band.minLot, lot - 1);
    reason = `One loss — step down to $${lot}. Band recalculates as balance moves.`;
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

/** Preview bands at sample balances — useful for setup UI */
export function previewBandScale(samples = [60, 100, 115, 150, 200, 400, 800]) {
  return samples.map((b) => ({
    balance: b,
    ...getBalanceBand(b),
  }));
}

export const PRO_MAX_LOSSES = 4;
export const PRO_DEFAULT_MAX_TRADES = 7;
export const PRO_WIN_MULTIPLIER = 0.9;
