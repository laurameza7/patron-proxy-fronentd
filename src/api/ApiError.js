export class ApiError extends Error {
  constructor(status, message, retryAfterSeconds = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }

  isRateLimited() {
    return this.status === 429;
  }

  isQuotaExhausted() {
    return this.status === 402;
  }
}
