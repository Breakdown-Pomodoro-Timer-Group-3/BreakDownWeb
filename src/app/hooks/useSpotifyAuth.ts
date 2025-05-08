import { useState, useEffect } from "react";
import { auth, db } from "@/app/lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";

export function useSpotifyAuth() {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadToken() {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data?.spotify_access_token) {
          setSpotifyToken(data.spotify_access_token);
        }
      }
    }
    loadToken();
  }, []);

  const connectSpotify = () => {
    const CLIENT_ID = "9e59ea95854d4298888f88f7c5055586";
    const REDIRECT_URI = "http://127.0.0.1:3000/callback";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const SCOPES = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state"
    ].join(" ");

    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;
  };

  const saveSpotifyTokens = async (access_token: string, refresh_token: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await setDoc(doc(db, "users", user.uid, "spotify"), {
      access_token,
      refresh_token,
      timestamp: Date.now(),
    });
    setSpotifyToken(access_token);
  };

  const refreshSpotifyToken = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const spotifyDoc = await getDoc(doc(db, "users", user.uid, "spotify"));
    if (spotifyDoc.exists()) {
      const { refresh_token } = spotifyDoc.data();
      if (!refresh_token) return;

      const response = await axios.post("http://127.0.0.1:4000/refresh", {
        refresh_token,
      });

      const { access_token } = response.data;
      await saveSpotifyTokens(access_token, refresh_token);
    }
  };

  return { spotifyToken, connectSpotify, saveSpotifyTokens, refreshSpotifyToken };
}
