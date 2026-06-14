export default function StateBanner({ state, sessionStatus }) {
  return (
    <div
      className="state-banner"
      style={{
        borderColor: state.color,
        background: state.bg,
      }}
    >
      <div className="state-banner-left">
        <span className="state-dot" style={{ background: state.color }} />
        <span className="state-label" style={{ color: state.color }}>
          {state.label}
        </span>
      </div>
      <p className="state-message">{state.message}</p>
      <span className="state-session" style={{ color: sessionStatus.color }}>
        {sessionStatus.label}
      </span>
    </div>
  );
}
