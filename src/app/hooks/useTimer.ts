import { useState, useEffect } from "react";

export function useTimer() {
  const [progress, setProgress] = useState(1);
  const [timeString, setTimeString] = useState("00:00");
  const [isRunning, setIsRunning] = useState(false);

  // This tracks the current time left:
  const [timeLeft, setTimeLeft] = useState(0);
  // This is the initial time we started with, for progress calculation:
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            setIsRunning(false);
            updateTimeString(0);
            setProgress(0);
            return 0;
          }
          updateTimeString(newTime);
          setProgress(newTime / initialTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, initialTime]);

  function updateTimeString(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    setTimeString(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  }

  // Start from fresh values (full reset):
  function startTimer(minutes: number, seconds: number) {
    const total = minutes * 60 + seconds;
    setInitialTime(total);
    setTimeLeft(total);
    setProgress(1);
    setIsRunning(true);
    updateTimeString(total);
  }

  // Fully stop & reset:
  function stopTimer() {
    setIsRunning(false);
    setTimeLeft(0);
    setInitialTime(0);
    setProgress(1);
    setTimeString("00:00");
  }

  // Just pause, no reset
  function pauseTimer() {
    setIsRunning(false);
  }

  // Resume from leftover time
  function resumeTimer() {
    // Only resume if there's leftover time
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }

  return {
    progress,
    timeString,
    isRunning,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    timeLeft,      // Exposed for debugging
    initialTime,   // Exposed for debugging
  };
}
