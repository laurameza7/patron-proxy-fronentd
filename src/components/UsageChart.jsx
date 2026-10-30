const DAY_FORMAT = { weekday: 'short' };

export function UsageChart({ history }) {
  if (!history.length) return <div className="card skeleton tall" />;
  const maxTokens = Math.max(...history.map((day) => day.tokens), 1);
  const total = history.reduce((sum, day) => sum + day.tokens, 0);

  return (
    <div className="card">
      <div className="card__header">
        <h3>Uso de los últimos 7 días</h3>
        <span className="muted">{total.toLocaleString('es-CO')} tokens</span>
      </div>
      <div className="chart">
        {history.map((day) => {
          const date = new Date(`${day.date}T00:00:00`);
          const height = (day.tokens / maxTokens) * 100;
          return (
            <div className="chart__column" key={day.date}>
              <div className="chart__track">
                <div
                  className="chart__bar"
                  style={{ height: `${Math.max(height, day.tokens ? 4 : 0)}%` }}
                  title={`${day.tokens.toLocaleString('es-CO')} tokens · ${day.requests} requests`}
                >
                  {day.tokens > 0 && <span className="chart__value">{compact(day.tokens)}</span>}
                </div>
              </div>
              <span className="chart__label">{date.toLocaleDateString('es-CO', DAY_FORMAT)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function compact(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);
}
