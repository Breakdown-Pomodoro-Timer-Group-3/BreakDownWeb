"use client";

import { useState, useEffect } from "react";
import { auth } from "@/app/lib/firebaseConfig"; // Import Firebase auth
import "@/app/styles/style.css"; // Import styles

const Timer = () => {
  const [time, setTime] = useState(25 * 60); // Default 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(1);
  const totalTime = 25 * 60; // Full session time for progress calculation

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      setSessions((prev) => prev + 1);
      setTime(totalTime); // Reset for next session
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculate progress for circular effect
  const progress = (time / totalTime) * 100;

  return (
    <div className="container">
      <h1 className="timer-title">BreakDown</h1>

      {/* Task Input */}
      <div className="task-container">
        <label htmlFor="taskInput">Current Task:</label>
        <input type="text" id="taskInput" placeholder="Enter your task..." />
      </div>

      {/* Circular Timer with Gradient */}
      <div className="timer-circle">
        <div
          className="progress-circle"
          style={{ background: `conic-gradient(#007bff ${progress}%, #8a2be2 ${progress}%, black 100%)` }}
        >
          <span id="timerDisplay">{formatTime(time)}</span>
        </div>
      </div>

      {/* Session Counter */}
      <p id="sessionCounter">Session: {sessions} / 4</p>

      {/* Timer Controls */}
      <div className="timer-controls">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={() => setTime(25 * 60)}>Reset</button>
      </div>
    </div>
  );
};

export default Timer;
