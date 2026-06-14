import { useState } from 'react';

export default function SevereWarningModal({ warnings }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || warnings.length === 0) return null;

  const primary = warnings[0];

  return (
    <div className="severe-modal-overlay">
      <div className={`severe-modal severe-modal--${primary.level}`}>
        <span className="severe-modal-icon">{primary.icon}</span>
        <h2>{primary.title}</h2>
        <p>{primary.message}</p>
        {warnings.length > 1 && (
          <div className="severe-modal-extra">
            {warnings.slice(1).map((w, i) => (
              <p key={i}><strong>{w.title}:</strong> {w.message}</p>
            ))}
          </div>
        )}
        <button className="severe-modal-btn" onClick={() => setDismissed(true)}>
          I Understand
        </button>
      </div>
    </div>
  );
}
