const formatNumber = (value) => value.toLocaleString('es-CO');

export function QuotaBar({ status }) {
  if (!status) return <div className="card skeleton" />;
  const unlimited = status.tokensLimit < 0;
  const percentage = unlimited ? 0 : Math.min(100, (status.tokensUsed / status.tokensLimit) * 100);
  const level = percentage >= 90 ? 'danger' : percentage >= 70 ? 'warning' : 'ok';
  const resetDate = new Date(`${status.resetDate}T00:00:00`).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long',
  });

  return (
    <div className="card">
      <div className="card__header">
        <h3>Cuota mensual de tokens</h3>
        <span className="muted">Se reinicia el {resetDate}</span>
      </div>
      {unlimited ? (
        <p className="big-number">∞ <span className="muted small">{formatNumber(status.tokensUsed)} usados</span></p>
      ) : (
        <>
          <div className="progress">
            <div className={`progress__fill progress__fill--${level}`} style={{ width: `${percentage}%` }} />
          </div>
          <div className="progress__legend">
            <span><strong>{formatNumber(status.tokensUsed)}</strong> usados</span>
            <span><strong>{formatNumber(status.tokensRemaining)}</strong> disponibles de {formatNumber(status.tokensLimit)}</span>
          </div>
        </>
      )}
    </div>
  );
}
