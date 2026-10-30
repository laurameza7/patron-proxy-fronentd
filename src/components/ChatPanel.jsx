import { useEffect, useRef, useState } from 'react';
import { TokenEstimator } from '../domain/TokenEstimator';

const LENGTH_OPTIONS = [
  { label: 'Corta', value: 256 },
  { label: 'Media', value: 1024 },
  { label: 'Larga', value: 2048 },
];

export function ChatPanel({ messages, isSending, blockedSeconds, quotaExhausted, onSend, onOpenUpgrade }) {
  const [prompt, setPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(LENGTH_OPTIONS[0].value);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const estimatedTokens = TokenEstimator.estimateRequest(prompt, maxTokens);
  const isBlocked = blockedSeconds > 0;
  const canSend = prompt.trim() && !isSending && !isBlocked;

  const submit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(prompt.trim(), maxTokens);
    setPrompt('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) submit(event);
  };

  return (
    <section className="chat card">
      <div className="chat__messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="empty">
            <div className="empty__icon">✦</div>
            <h2>¿En qué te ayudo hoy?</h2>
            <p className="muted">Cada mensaje pasa por el <strong>RateLimitProxy</strong> y el <strong>QuotaProxy</strong> antes de llegar al servicio de IA.</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`message message--${message.role}`}>
            <div className="message__bubble">{message.text}</div>
            {message.meta && <span className="message__meta">{message.meta}</span>}
          </div>
        ))}
        {isSending && (
          <div className="message message--assistant">
            <div className="message__bubble typing"><span /><span /><span /></div>
          </div>
        )}
      </div>

      {isBlocked && (
        <div className="banner banner--warning">
          Alcanzaste el límite de requests por minuto. Podrás enviar de nuevo en <strong>{blockedSeconds}s</strong>.
        </div>
      )}
      {quotaExhausted && (
        <div className="banner banner--danger">
          Agotaste tu cuota mensual. <button className="link" onClick={onOpenUpgrade}>Mejorar plan</button>
        </div>
      )}

      <form className="composer" onSubmit={submit}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu prompt…"
          rows={2}
          maxLength={4000}
        />
        <div className="composer__footer">
          <div className="segmented" role="group" aria-label="Longitud de la respuesta">
            {LENGTH_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={maxTokens === option.value ? 'active' : ''}
                onClick={() => setMaxTokens(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="estimate" title="Tokens del prompt + máximo de tokens de respuesta">
            ≈ {estimatedTokens.toLocaleString('es-CO')} tokens
          </span>
          <button className="send" type="submit" disabled={!canSend}>
            {isBlocked ? `${blockedSeconds}s` : isSending ? 'Generando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </section>
  );
}
