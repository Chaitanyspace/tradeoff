import { useState } from 'react';
import { previewProfileLots, PRO_DEFAULT_MAX_TRADES, getBalanceBand } from '../../utils/proLotEngine';

export default function ProSetupForm({ onStart }) {
  const [balance, setBalance] = useState('');
  const [maxTrades, setMaxTrades] = useState(String(PRO_DEFAULT_MAX_TRADES));
  const [selectedProfile, setSelectedProfile] = useState(null);

  const numBalance = Number(balance);
  const numMaxTrades = Number(maxTrades);
  const isValidBalance = !isNaN(numBalance) && numBalance > 0;
  const isValidMaxTrades = !isNaN(numMaxTrades) && numMaxTrades >= 1 && numMaxTrades <= 50;
  const previews = isValidBalance ? previewProfileLots(numBalance) : [];
  const band = isValidBalance ? getBalanceBand(numBalance) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidBalance || !selectedProfile || !isValidMaxTrades) return;
    onStart(numBalance, selectedProfile, numMaxTrades);
  };

  return (
    <div className="pro-setup">
      <div className="pro-setup-hero">
        <span className="pro-setup-badge">PRO</span>
        <h1>Risk Office Pro</h1>
        <p>
          Set your balance, max trades for today, and pick your aggression profile.
          Lot sizes follow your intuitive bands — always low aggression.
        </p>
      </div>

      <form className="pro-setup-form" onSubmit={handleSubmit}>
        <div className="pro-setup-row">
          <label className="pro-setup-label pro-setup-label--half">
            Current Balance
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 60"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              autoFocus
            />
          </label>

          <label className="pro-setup-label pro-setup-label--half">
            Max Trades Today
            <input
              type="number"
              min="1"
              max="50"
              placeholder="e.g. 7"
              value={maxTrades}
              onChange={(e) => setMaxTrades(e.target.value)}
            />
          </label>
        </div>

        {band && (
          <div className="pro-band-hint">
            At <strong>${numBalance}</strong> your intuitive risk band is{' '}
            <strong>{band.rangeLabel}</strong> per trade
          </div>
        )}

        {isValidBalance && (
          <div className="pro-profile-grid">
            <p className="pro-profile-heading">
              Choose profile — Safest / Safe / Low Aggressive within your band
            </p>
            {previews.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={`pro-profile-card ${selectedProfile === profile.id ? 'pro-profile-card--selected' : ''}`}
                style={{
                  '--profile-color': profile.color,
                  '--profile-glow': profile.glow,
                }}
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="pro-profile-card-top">
                  <span className="pro-profile-name">{profile.label}</span>
                  <span className="pro-profile-tag">{profile.tagline}</span>
                </div>
                <p className="pro-profile-desc">{profile.description}</p>
                <div className="pro-profile-lot">
                  <span className="pro-profile-lot-label">Your lot</span>
                  <span className="pro-profile-lot-value">${profile.previewLot}</span>
                </div>
                <span className="pro-profile-tier">
                  Band {profile.rangeLabel} · loss limit 4 (fixed)
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="pro-setup-start"
          disabled={!isValidBalance || !selectedProfile || !isValidMaxTrades}
        >
          Start Pro Session
        </button>
      </form>
    </div>
  );
}
