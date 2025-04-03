import React, { useState } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebaseConfig";

export default function Timer() {
  const {
    progress,
    timeString,
    isRunning,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    timeLeft,
    initialTime,
  } = useTimer();

  // handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally redirect or show a message
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Track if the user is in a paused state
  const [isPaused, setIsPaused] = useState(false);

  // Debug logs (optional, can remove later)
  console.log("isRunning:", isRunning, "isPaused:", isPaused, "timeLeft:", timeLeft);

  // Start/Resume button:
  const handleStartResume = () => {
    // If we are running, do nothing (or do your own logic).
    if (isRunning) return;

    // If currently paused, resume leftover time:
    if (isPaused && timeLeft > 0) {
      resumeTimer();
      setIsPaused(false);
    }
    // Otherwise, start fresh:
    else {
      // Let's do 1 minute by default so you can see the pause effect
      startTimer(1, 0);
      setIsPaused(false);
    }
  };

  // Pause/Stop button:
  const handlePauseStop = () => {
    // If the timer is running and not paused => first click: pause
    if (isRunning && !isPaused) {
      pauseTimer();
      setIsPaused(true);
    }
    // If we are already paused => second click: stop
    else if (isPaused) {
      stopTimer();
      setIsPaused(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="absolute top-10 left-5 text-2xl font-bold">BreakDown</h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-10 right-5 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
      >
        Logout
      </button>

      <div className="relative w-60 h-60 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#2563EB"
            strokeWidth="8"
            strokeDasharray="282.6"
            strokeDashoffset={282.6 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          {/* You can remove the knob if you'd like */}
          <circle cx="50" cy="5" r="4" fill="#fff" stroke="#2563EB" strokeWidth="2" />
        </svg>
        <div className="absolute text-3xl font-medium">{timeString}</div>
      </div>

      <div className="mt-10 flex space-x-4">
        {/* Start/Resume Button */}
        <button
          className="p-5 bg-stone-700 rounded-full shadow-lg hover:bg-stone-600 transition-transform active:scale-90"
          onClick={handleStartResume}
        >
          {/* Play icon */}
          <svg
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </button>

        {/* Pause/Stop Button */}
        <button
          className="p-5 bg-neutral-700 rounded-full shadow-lg hover:bg-neutral-600 transition-transform active:scale-90"
          onClick={handlePauseStop}
        >
          {/* Pause icon */}
          <svg
            className="w-10 h-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
