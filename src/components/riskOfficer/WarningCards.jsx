const LEVEL_CLASS = {
  warning: 'warning-card--warning',
  danger: 'warning-card--danger',
  critical: 'warning-card--critical',
  info: 'warning-card--info',
};

export default function WarningCards({ warnings }) {
  if (warnings.length === 0) return null;

  return (
    <div className="warning-cards">
      {warnings.map((w, i) => (
        <div
          key={`${w.title}-${i}`}
          className={`warning-card ${LEVEL_CLASS[w.level] || ''}`}
        >
          <span className="warning-card-icon">{w.icon}</span>
          <div className="warning-card-content">
            <h3>{w.title}</h3>
            <p>{w.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
