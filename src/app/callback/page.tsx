"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import axios from "axios";

export default function CallbackPage() {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Listen for Firebase Auth user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function handleSpotifyAuth() {
      if (!authChecked) {
        console.log("Waiting for Firebase Auth to be ready...");
        return;
      }

      if (!firebaseUser) {
        console.error("No Firebase user found. Redirecting to login...");
        router.push("/home");
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("No Spotify auth code found in URL.");
        router.push("/");
        return;
      }

      try {
        console.log("Exchanging Spotify code...");
        const response = await axios.post("http://127.0.0.1:4000/auth", { code });

        const { access_token, refresh_token } = response.data;
        console.log("Spotify tokens received:", { access_token, refresh_token });

        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            spotify_access_token: access_token,
            spotify_refresh_token: refresh_token,
            spotify_token_timestamp: Date.now(),
          },
          { merge: true } // Don't overwrite user's other data
        );

        console.log("Spotify tokens saved successfully!");
        router.push("/"); // Redirect back to main Timer page
      } catch (error: any) {
        console.error("Error exchanging Spotify code:", error.message);
        if (error.response) {
          console.error("Server responded:", error.response.data);
        }
      }
    }

    handleSpotifyAuth();
  }, [firebaseUser, authChecked, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white">
      <div className="text-2xl font-bold mb-4">Connecting to Spotify...</div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );
}
