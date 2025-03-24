"use client";

import { useEffect } from "react";
import { auth } from "@/app/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/home"); // Redirect logged-in users to Dashboard
      } else {
        router.push("/login"); // Redirect guests to Login
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <p>Redirecting...</p>
    </div>
  );
}
