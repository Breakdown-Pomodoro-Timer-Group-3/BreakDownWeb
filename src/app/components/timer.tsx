import React, { useState, useEffect } from "react";
import { useTimer } from "@/app/hooks/useTimer";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebaseConfig";


import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

interface Task {
  id: string;      // Firestore doc ID
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
    initialTime,
  } = useTimer();


  // -------------- CHECKLIST State --------------
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  // -------------- FIREBASE LOGIC --------------
  // 1) Setup Firestore ref
  const user = auth.currentUser;
  const tasksCollectionRef = user
    ? collection(db, "users", user.uid, "todos")
    : null;

  // 2) Listen for real-time task updates from Firestore
  useEffect(() => {
    if (!tasksCollectionRef) return;

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      // Convert docs to the Task[] shape
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

  // 3) Add a new task to Firestore
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

  // 4) Toggle Task (done/undone)
  const handleToggleTask = async (task: Task) => {
    if (!tasksCollectionRef) return;
    try {
      const docRef = doc(tasksCollectionRef, task.id);
      await updateDoc(docRef, { done: !task.done });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // 5) Remove a task
  const handleRemoveTask = async (task: Task) => {
    if (!tasksCollectionRef) return;
    try {
      const docRef = doc(tasksCollectionRef, task.id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };


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


  // Start/Resume button:
  const handleStartResume = () => {
    if (isRunning) return;

    // If currently paused, resume leftover time:
    if (isPaused && timeLeft > 0) {
      resumeTimer();
      setIsPaused(false);
    }
    // Otherwise, start fresh:
    else {
      // 1 minute by default
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
            stroke="oklch(55.3% 0.013 58.071)"
            strokeWidth="8"
            strokeDasharray="282.6"
            strokeDashoffset={282.6 * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          {/* You can remove the knob if you'd like */}
          <circle cx="50" cy="5" r="4" fill="#fff" stroke="oklch(55.3% 0.013 58.071)" strokeWidth="2" />
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

      

      {/* Checklist Section */}
      <div className="absolute top-30 left-5 m-auto w-80">
        <h2 className="text-lg font-bold mb-2">Task Checklist</h2>

        {/* New Task Input */}
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
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between bg-gray-700 p-2 rounded"
            >
              {/* Checkbox + Task Text */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task)}
                  className="mr-2"
                />
                <span className={task.done ? "line-through" : ""}>
                  {task.text}
                </span>
              </label>

              {/* Remove Button */}
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
