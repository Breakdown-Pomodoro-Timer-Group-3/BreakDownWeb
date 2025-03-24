import { useState, useEffect } from "react";

const useTimer = (initialTime: number) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const startTimer = () => setIsRunning(true);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  return { time, isRunning, startTimer, resetTimer };
};

export default useTimer;
