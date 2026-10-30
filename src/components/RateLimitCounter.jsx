export function RateLimitCounter({ status, secondsToReset }) {
  if (!status) return <div className="card skeleton" />;
  const unlimited = status.requestsLimitPerMinute < 0;
  const used = status.requestsUsedThisMinute;
  const limit = status.requestsLimitPerMinute;
  const blocked = !unlimited && used >= limit;

  return (
    <div className={`card ${blocked ? 'card--alert' : ''}`}>
      <div className="card__header">
        <h3>Requests por minuto</h3>
        <span className="countdown" title="Tiempo hasta el reinicio">⟳ {secondsToReset}s</span>
      </div>
      <p className="big-number">
        {used}
        <span className="muted small"> / {unlimited ? '∞' : limit}</span>
      </p>
      {!unlimited && (
        <div className="dots">
          {Array.from({ length: Math.min(limit, 60) }).map((_, index) => (
            <span key={index} className={`dot ${index < used ? 'dot--used' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}
