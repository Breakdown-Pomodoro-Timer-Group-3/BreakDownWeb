"use client";

import { useEffect, useState } from "react";
import { auth } from "@/app/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Timer from "@/app/components/timer";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // Redirect if not logged in
      } else {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark text-white">
      {user ? <Timer /> : <p>Loading...</p>}
      <button onClick={() => signOut(auth)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
}
