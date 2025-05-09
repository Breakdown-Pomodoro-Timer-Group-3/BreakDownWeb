import { useState, useEffect, useRef } from "react";

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTime = useRef(0); // total duration for progress calculation

  const startTimer = (minutes: number, seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const totalSeconds = minutes * 60 + seconds;
    setTimeLeft(totalSeconds);
    totalTime.current = totalSeconds;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (isRunning || timeLeft <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(0);
    setIsRunning(false);
  };

  const timeString = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  const progress = totalTime.current
    ? 1 - timeLeft / totalTime.current
    : 0;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    timeLeft,
    timeString,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    progress,
  };
}
