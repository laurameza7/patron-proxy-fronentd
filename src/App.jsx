import { useCallback, useEffect, useMemo, useState } from 'react';
import { AIPlatformClient } from './api/AIPlatformClient';
import { UserIdentity } from './domain/UserIdentity';
import { useSecondTicker } from './hooks/useSecondTicker';
import { PlanBadge } from './components/PlanBadge';
import { QuotaBar } from './components/QuotaBar';
import { RateLimitCounter } from './components/RateLimitCounter';
import { UsageChart } from './components/UsageChart';
import { ChatPanel } from './components/ChatPanel';
import { UpgradeModal } from './components/UpgradeModal';

const API_URL = import.meta.env.VITE_API_URL;

let messageSequence = 0;
const createMessage = (role, text, meta = null) => ({ id: ++messageSequence, role, text, meta });

export default function App() {
  const userId = useMemo(() => UserIdentity.resolve(), []);
  const client = useMemo(() => new AIPlatformClient(API_URL, userId), [userId]);
  const now = useSecondTicker();

  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [rateResetAt, setRateResetAt] = useState(null);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const applyStatus = useCallback((newStatus) => {
    setStatus(newStatus);
    setRateResetAt(Date.now() + newStatus.secondsUntilRateLimitReset * 1000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [newStatus, newHistory] = await Promise.all([client.getQuotaStatus(), client.getUsageHistory()]);
      applyStatus(newStatus);
      setHistory(newHistory);
      setConnectionError('');
    } catch (error) {
      setConnectionError(error.message);
    }
  }, [client, applyStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const secondsToReset = rateResetAt ? Math.max(0, Math.ceil((rateResetAt - now) / 1000)) : 0;
  const blockedSeconds = blockedUntil ? Math.max(0, Math.ceil((blockedUntil - now) / 1000)) : 0;

  useEffect(() => {
    if (rateResetAt && secondsToReset === 0) {
      setBlockedUntil(null);
      refresh();
    }
  }, [secondsToReset, rateResetAt, refresh]);

  const handleSend = async (prompt, maxTokens) => {
    setMessages((current) => [...current, createMessage('user', prompt)]);
    setIsSending(true);
    try {
      const response = await client.generate(prompt, maxTokens);
      const meta = `${response.totalTokens.toLocaleString('es-CO')} tokens · ${(response.processingTimeMs / 1000).toFixed(1)} s`;
      setMessages((current) => [...current, createMessage('assistant', response.text, meta)]);
      if (response.quota) applyStatus(response.quota);
      setHistory(await client.getUsageHistory());
    } catch (error) {
      if (error.isRateLimited?.()) {
        setBlockedUntil(Date.now() + (error.retryAfterSeconds ?? 60) * 1000);
        setMessages((current) => [...current, createMessage('error', `429 · ${error.message}`)]);
      } else if (error.isQuotaExhausted?.()) {
        setQuotaExhausted(true);
        setShowUpgrade(true);
        setMessages((current) => [...current, createMessage('error', `402 · ${error.message}`)]);
      } else {
        setMessages((current) => [...current, createMessage('error', error.message)]);
      }
      refresh();
    } finally {
      setIsSending(false);
    }
  };

  const handleUpgrade = async (targetPlan, cardHolder, lastDigits) => {
    const result = await client.upgradePlan(targetPlan, cardHolder, lastDigits);
    applyStatus(result.quota);
    setQuotaExhausted(false);
    setBlockedUntil(null);
    setMessages((current) => [...current, createMessage('system', `${result.message} · Transacción ${result.transactionId}`)]);
  };

  const canUpgrade = status && status.plan !== 'ENTERPRISE';

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <span className="brand__logo">✦</span>
          <div>
            <h1>Proxy AI</h1>
            <span className="muted small">Rate limiting y cuotas con el patrón Proxy</span>
          </div>
        </div>
        <div className="topbar__actions">
          {status && <PlanBadge planCode={status.plan} />}
          {canUpgrade && (
            <button className="ghost" onClick={() => setShowUpgrade(true)}>Mejorar plan</button>
          )}
        </div>
      </header>

      {connectionError && <div className="banner banner--danger page-banner">{connectionError}</div>}

      <main className="content">
        <ChatPanel
          messages={messages}
          isSending={isSending}
          blockedSeconds={blockedSeconds}
          quotaExhausted={quotaExhausted}
          onSend={handleSend}
          onOpenUpgrade={() => setShowUpgrade(true)}
        />
        <aside className="sidebar">
          <QuotaBar status={status} />
          <RateLimitCounter status={status} secondsToReset={secondsToReset} />
          <UsageChart history={history} />
          <div className="chain card">
            <h3>Cadena de proxies</h3>
            <ol>
              <li><strong>RateLimitProxy</strong><span className="muted small">429 si excedes req/min</span></li>
              <li><strong>QuotaProxy</strong><span className="muted small">402 si agotas tokens</span></li>
              <li><strong>MockAIGenerationService</strong><span className="muted small">Servicio real · 1.2 s</span></li>
            </ol>
            <span className="muted small">Usuario: {userId}</span>
          </div>
        </aside>
      </main>

      {showUpgrade && status && (
        <UpgradeModal currentPlan={status.plan} onClose={() => setShowUpgrade(false)} onConfirm={handleUpgrade} />
      )}
    </div>
  );
}
