import { useState } from 'react';
import { loadDb, saveDb } from '../utils/storage';
import './Journal.css';

export default function Journal() {
  const [db, setDb] = useState(() => loadDb());
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState('LONG');
  const [notes, setNotes] = useState('');
  const [pnl, setPnl] = useState('');

  const entries = db.journal.entries;

  const addEntry = (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    const entry = {
      id: Date.now(),
      symbol: symbol.trim().toUpperCase(),
      direction,
      pnl: pnl ? Number(pnl) : null,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
    };

    const nextDb = {
      ...db,
      journal: { entries: [entry, ...entries] },
    };
    setDb(nextDb);
    saveDb(nextDb);
    setSymbol('');
    setNotes('');
    setPnl('');
  };

  const removeEntry = (id) => {
    const nextDb = {
      ...db,
      journal: { entries: entries.filter((en) => en.id !== id) },
    };
    setDb(nextDb);
    saveDb(nextDb);
  };

  return (
    <div className="journal">
      <header className="journal-header">
        <h1>Trade Journal</h1>
        <p>Log your trades and review your history.</p>
      </header>

      <form className="journal-form" onSubmit={addEntry}>
        <div className="journal-form-row">
          <input
            type="text"
            placeholder="Symbol (e.g. EURUSD)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="LONG">LONG</option>
            <option value="SHORT">SHORT</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="P&L (optional)"
            value={pnl}
            onChange={(e) => setPnl(e.target.value)}
          />
        </div>
        <textarea
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        <button type="submit" className="journal-submit">Add Entry</button>
      </form>

      <div className="journal-entries">
        {entries.length === 0 ? (
          <p className="journal-empty">No journal entries yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="journal-entry-top">
                <span className="journal-symbol">{entry.symbol}</span>
                <span className={`journal-direction ${entry.direction.toLowerCase()}`}>
                  {entry.direction}
                </span>
                {entry.pnl !== null && (
                  <span className={`journal-pnl ${entry.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {entry.pnl >= 0 ? '+' : ''}{entry.pnl}
                  </span>
                )}
                <button
                  className="journal-delete"
                  onClick={() => removeEntry(entry.id)}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </div>
              {entry.notes && <p className="journal-notes">{entry.notes}</p>}
              <time className="journal-time">
                {new Date(entry.timestamp).toLocaleString()}
              </time>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
