import { useEffect, useState } from "react";
import axios from "axios";

export function useSpotifyData(accessToken: string | null) {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (!accessToken) return;

    fetchCurrentSong();
    fetchPlaylists();

    // Optional: auto-refresh song every 5s
    const interval = setInterval(() => {
      fetchCurrentSong();
    }, 5000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const fetchCurrentSong = async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.item) {
        setCurrentTrack(response.data.item);
      }
    } catch (error) {
      console.error("Failed to fetch current track:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setPlaylists(response.data.items);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  };

  return { currentTrack, playlists };
}
