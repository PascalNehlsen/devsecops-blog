import { useCallback, useState } from 'react';

const KEY = 'game.highscore.v1';

function read(): number {
  try {
    const raw = window.localStorage.getItem(KEY);
    const value = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/* The overlay never renders on the server (it mounts on keypress), so
   reading localStorage in the initializer is hydration-safe here. */
export function useHighscore(): [number, (score: number) => boolean] {
  const [highscore, setHighscore] = useState(read);

  const submit = useCallback(
    (score: number): boolean => {
      if (score <= read()) {
        return false;
      }
      setHighscore(score);
      try {
        window.localStorage.setItem(KEY, String(score));
      } catch {
        /* Private mode: shown for this session, not persisted. */
      }
      return true;
    },
    []
  );

  return [highscore, submit];
}
