const STORAGE_KEY = 'proxy-ai-user-id';

export class UserIdentity {
  static resolve() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      const created = `user-${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem(STORAGE_KEY, created);
      return created;
    } catch {
      return `user-${Math.random().toString(36).slice(2, 10)}`;
    }
  }
}
