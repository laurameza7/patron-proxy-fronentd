import { useState } from 'react';
import { Plan } from '../domain/Plan';

export function UpgradeModal({ currentPlan, onClose, onConfirm }) {
  const options = ['PRO', 'ENTERPRISE'].filter((code) => code !== currentPlan);
  const [target, setTarget] = useState(options[0]);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');

  const pay = async (event) => {
    event.preventDefault();
    const digits = cardNumber.replace(/\D/g, '');
    if (!cardHolder.trim() || digits.length < 12) {
      setError('Completa el nombre y una tarjeta de prueba válida.');
      return;
    }
    setError('');
    setStep('processing');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onConfirm(target, cardHolder.trim(), digits.slice(-4));
      setStep('done');
    } catch (requestError) {
      setError(requestError.message);
      setStep('form');
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Cerrar">×</button>
        {step === 'done' ? (
          <div className="modal__success">
            <div className="success-icon">✓</div>
            <h2>¡Pago aprobado!</h2>
            <p className="muted">Ya estás en el plan {Plan.of(target).label}. Tus nuevos límites están activos.</p>
            <button className="send" onClick={onClose}>Continuar</button>
          </div>
        ) : (
          <form onSubmit={pay}>
            <h2>Mejora tu plan</h2>
            <p className="muted">Agotaste tu cuota mensual. Elige un plan para seguir generando.</p>
            <div className="plans">
              {options.map((code) => {
                const plan = Plan.of(code);
                return (
                  <label key={code} className={`plan ${target === code ? 'plan--selected' : ''}`}>
                    <input type="radio" name="plan" checked={target === code} onChange={() => setTarget(code)} />
                    <span className={`badge badge--${code.toLowerCase()}`}>{plan.label}</span>
                    <strong className="plan__price">US${plan.priceUsd}<small>/mes</small></strong>
                    <span className="muted small">{plan.describeRequests()}</span>
                    <span className="muted small">{plan.describeTokens()}</span>
                  </label>
                );
              })}
            </div>
            <div className="payment">
              <span className="sim-tag">Pago simulado · no se cobra nada</span>
              <input placeholder="Nombre en la tarjeta" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
              <input
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, '').slice(0, 19))}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="send wide" type="submit" disabled={step === 'processing'}>
              {step === 'processing' ? 'Procesando pago…' : `Pagar US$${Plan.of(target).priceUsd}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
