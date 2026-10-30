/**
 * Mirrors the backend heuristic: ~4 characters per token.
 */
export class TokenEstimator {
  static CHARACTERS_PER_TOKEN = 4;

  static estimateText(text) {
    if (!text || !text.trim()) return 0;
    return Math.ceil(text.length / TokenEstimator.CHARACTERS_PER_TOKEN);
  }

  static estimateRequest(prompt, maxTokens) {
    return TokenEstimator.estimateText(prompt) + maxTokens;
  }
}
