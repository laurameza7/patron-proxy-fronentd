export class Plan {
  static CATALOG = {
    FREE: new Plan('FREE', 'Free', 10, 50_000, 0),
    PRO: new Plan('PRO', 'Pro', 60, 500_000, 19),
    ENTERPRISE: new Plan('ENTERPRISE', 'Enterprise', null, null, 99),
  };

  constructor(code, label, requestsPerMinute, monthlyTokens, priceUsd) {
    this.code = code;
    this.label = label;
    this.requestsPerMinute = requestsPerMinute;
    this.monthlyTokens = monthlyTokens;
    this.priceUsd = priceUsd;
  }

  static of(code) {
    return Plan.CATALOG[code] ?? Plan.CATALOG.FREE;
  }

  isUnlimited() {
    return this.monthlyTokens === null;
  }

  describeRequests() {
    return this.requestsPerMinute === null ? 'Ilimitadas' : `${this.requestsPerMinute} req/min`;
  }

  describeTokens() {
    return this.monthlyTokens === null ? 'Tokens ilimitados' : `${this.monthlyTokens.toLocaleString('es-CO')} tokens/mes`;
  }
}
