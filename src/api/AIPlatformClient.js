import { ApiError } from './ApiError';

const DEFAULT_BASE_URL = 'http://localhost:8080';

/**
 * HTTP client for the AI Proxy Platform backend.
 * Every request carries the X-User-Id header that identifies the user.
 */
export class AIPlatformClient {
  constructor(baseUrl, userId) {
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.userId = userId;
  }

  generate(prompt, maxTokens) {
    return this.#request('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, maxTokens }),
    });
  }

  getQuotaStatus() {
    return this.#request('/api/quota/status');
  }

  getUsageHistory() {
    return this.#request('/api/quota/history');
  }

  upgradePlan(targetPlan, cardHolder, cardLastDigits) {
    return this.#request('/api/quota/upgrade', {
      method: 'POST',
      body: JSON.stringify({ targetPlan, cardHolder, cardLastDigits }),
    });
  }

  async #request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.userId,
        },
      });
    } catch {
      throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    }

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const retryHeader = response.headers.get('Retry-After');
      const retryAfter = retryHeader ? Number(retryHeader) : body.retryAfterSeconds ?? null;
      throw new ApiError(response.status, body.message || 'Ocurrió un error inesperado', retryAfter);
    }
    return body;
  }
}
