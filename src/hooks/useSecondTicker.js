import { useEffect, useState } from 'react';

/** Re-renders every second and returns the current timestamp. */
export function useSecondTicker() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
