import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialSeconds: number, onTimeUp: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeUpRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft > 0]);

  const startTimer = useCallback(() => setIsActive(true), []);
  const stopTimer = useCallback(() => setIsActive(false), []);
  const resetTimer = useCallback((newTime: number) => {
    setTimeLeft(newTime);
    setIsActive(false);
  }, []);

  return { timeLeft, startTimer, stopTimer, resetTimer, isActive, setTimeLeft };
};
