const DB_KEY = 'tradeoff_db';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultRiskOfficerState(startingBalance = 38) {
  return {
    startingBalance,
    currentBalance: startingBalance,
    peakBalance: startingBalance,
    lossStreak: 0,
    tradeCount: 0,
    trades: [],
    sessionDate: getTodayKey(),
    tradingDisabled: false,
    disableReason: null,
  };
}

export function getDefaultDb() {
  return {
    journal: { entries: [] },
    riskOfficer: getDefaultRiskOfficerState(),
  };
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return getDefaultDb();
    const parsed = JSON.parse(raw);
    return {
      journal: parsed.journal || { entries: [] },
      riskOfficer: {
        ...getDefaultRiskOfficerState(),
        ...parsed.riskOfficer,
      },
    };
  } catch {
    return getDefaultDb();
  }
}

export function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db, null, 2));
}

export function exportDbJson(db) {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tradeoff-${getTodayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importDbJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        resolve({
          journal: parsed.journal || { entries: [] },
          riskOfficer: {
            ...getDefaultRiskOfficerState(),
            ...parsed.riskOfficer,
          },
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export { getTodayKey };
