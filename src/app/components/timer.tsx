import React, { useState, useEffect } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebaseConfig";
import Image from "next/image";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

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
  } = useTimer();

  const [workMinutes, setWorkMinutes] = useState(25);
  const [customWork, setCustomWork] = useState<number | null>(null);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sessionCount, setSessionCount] = useState(0);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState<"work" | "break" | "longBreak">("work");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const user = auth.currentUser;
  const tasksCollectionRef = user
    ? collection(db, "users", user.uid, "todos")
    : null;

  useEffect(() => {
    if (!tasksCollectionRef) return;

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      const newTasks: Task[] = snapshot.docs.map((docSnap) => {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Task;
      });
      setTasks(newTasks);
    });

    return () => unsubscribe();
  }, [tasksCollectionRef]);

  const handleAddTask = async () => {
    if (!newTaskText.trim() || !tasksCollectionRef) return;
    try {
      await addDoc(tasksCollectionRef, {
        text: newTaskText.trim(),
        done: false,
        createdAt: serverTimestamp(),
      });
      setNewTaskText("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!tasksCollectionRef) return;
    try {
      const docRef = doc(tasksCollectionRef, task.id);
      await updateDoc(docRef, { done: !task.done });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleRemoveTask = async (task: Task) => {
    if (!tasksCollectionRef) return;
    try {
      const docRef = doc(tasksCollectionRef, task.id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleStartResume = () => {
    if (isRunning) return;

    if (isPaused && timeLeft > 0) {
      resumeTimer();
      setIsPaused(false);
    } else {
      const duration = customWork !== null ? customWork : workMinutes;
      startTimer(duration, 0);
      setIsWorkSession(true);
      setSessionType("work");
      setIsPaused(false);
    }
  };

  const handlePauseStop = () => {
    if (isRunning && !isPaused) {
      pauseTimer();
      setIsPaused(true);
    } else if (isPaused) {
      stopTimer();
      setIsPaused(false);
    }
  };

  // Refs to handle session switch reliably
  const prevIsRunningRef = React.useRef(false);
  const prevTimeLeftRef = React.useRef(timeLeft);

  useEffect(() => {
    // When timer stops and timeLeft hits 0
    if (prevIsRunningRef.current && prevTimeLeftRef.current > 0 && timeLeft === 0 && !isRunning) {
      if (sessionType === "work") {
        const nextCount = sessionCount + 1;
        setSessionCount(nextCount);
        setIsWorkSession(false);
        if (nextCount % 4 === 0) {
          setSessionType("longBreak");
          startTimer(longBreakMinutes, 0);
        } else {
          setSessionType("break");
          startTimer(breakMinutes, 0);
        }
      } else {
        const duration = customWork !== null ? customWork : workMinutes;
        setIsWorkSession(true);
        setSessionType("work");
        startTimer(duration, 0);
      }
    }
    prevIsRunningRef.current = isRunning;
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, isRunning]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <h1 className="absolute top-10 left-5 text-2xl font-bold">BreakDown</h1>

      <button
        onClick={handleLogout}
        className="absolute top-10 right-5 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
      >
        Logout
      </button>

      <div className="mb-6 space-y-2">
        <div>
          <label>Work Duration: </label>
          <select
            value={customWork !== null ? 0 : workMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val === 0) {
                setCustomWork(15);
              } else {
                setCustomWork(null);
                setWorkMinutes(val);
              }
            }}
          >
            {[15, 25, 60].map((min) => (
              <option key={min} value={min}>{min} min</option>
            ))}
            <option value={0}>Custom</option>
          </select>
          {customWork !== null && (
            <input
              type="number"
              value={customWork}
              min={1}
              onChange={(e) => setCustomWork(parseInt(e.target.value))}
              className="ml-2 p-1 text-white rounded w-20"
            />
          )}
        </div>
        <div>
          <label>Short Break: </label>
          <input
            type="number"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
            className="ml-2 p-1 text-white rounded w-20"
          />
        </div>
        <div>
          <label>Long Break: </label>
          <input
            type="number"
            value={longBreakMinutes}
            onChange={(e) => setLongBreakMinutes(parseInt(e.target.value))}
            className="ml-2 p-1 text-white rounded w-20"
          />
        </div>
      </div>
      
       
      <div className="relative w-60 h-60 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="oklch(0.64 0.1801 240.35)"
            strokeWidth="8"
            strokeDasharray="282.6"
            strokeDashoffset={282.6 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <circle cx="50" cy="5" r="4" fill="#fff" stroke="oklch(0.64 0.1801 240.35)" strokeWidth="2" />
        </svg>
        <div className="absolute text-3xl font-medium">{timeString}</div>
      </div>

      <div className="mt-10 flex space-x-4">
        <button
          className="p-5 bg-stone-700 rounded-full shadow-lg hover:bg-stone-600 transition-transform active:scale-90"
          onClick={handleStartResume}
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 4 20 12 6 20 6 4" />
          </svg>
        </button>
        <button
          className="p-5 bg-neutral-700 rounded-full shadow-lg hover:bg-neutral-600 transition-transform active:scale-90"
          onClick={handlePauseStop}
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </button>
      </div>

      {/* session counter */}
      <div className="absolute top-30 absolute right-5 m-auto text-sm text-center">
        Sessions: {sessionCount}
      </div>


      <div className="absolute top-30 left-5 m-auto w-80">
        <h2 className="text-lg font-bold mb-2">Task Checklist</h2>
        <div className="flex items-center mb-4 space-x-2">
          <input
            className="flex-1 p-2 text-white rounded"
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="New task..."
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: "oklch(0.64 0.1801 240.35)",
              transition: "filter 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            Add
          </button>

        </div>
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task)}
                  className="mr-2"
                />
                <span className={task.done ? "line-through" : ""}>{task.text}</span>
              </label>
              <button
                onClick={() => handleRemoveTask(task)}
                className="bg-red-600 px-2 py-1 rounded hover:bg-red-500 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
