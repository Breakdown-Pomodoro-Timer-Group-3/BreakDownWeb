import { useEffect, useState } from "react";
import axios from "axios";

export function useSpotifyPlayer(accessToken: string | null) {
  const [player, setPlayer] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);


  useEffect(() => {
    if (!accessToken) return;

    // Load Spotify SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new (window as any).Spotify.Player({
        name: "BreakDown Mini Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      newPlayer.addListener("ready", ({ device_id }: { device_id: string }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setIsPaused(state.paused);
        fetchCurrentSong();
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };

    fetchUserPlaylists();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  const fetchCurrentSong = async () => {
    if (!accessToken) return;
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
      console.error("Failed to fetch current song:", error);
    }
  };

  const fetchUserPlaylists = async () => {
    if (!accessToken) return;
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

  const togglePlay = async () => {
    console.log("Access Token:", accessToken);
    console.log("Device ID:", deviceId);

    if (!accessToken || !deviceId) {
      console.error("Missing access token or device id");
      return;
    }
  
    try {
      const stateResponse = await axios.get(
        "https://api.spotify.com/v1/me/player",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const isPausedNow = stateResponse.data?.is_playing === false;
  
      if (isPausedNow) {
        await axios.put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Resumed playback!");
      } else {
        await axios.put(
          `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("Paused playback!");
      }
    } catch (error) {
      console.error("Failed to toggle playback:", error);
    }
  };
  

  const playPlaylist = async (playlistUri: string) => {
    if (!accessToken || !deviceId) {
      console.error("Missing access token or device id");
      return;
    }
  
    try {
      console.log("Transferring playback to mini player...");
      await axios.put(
        "https://api.spotify.com/v1/me/player",
        {
          device_ids: [deviceId],
          play: true,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      console.log("Playing playlist from beginning...");
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          context_uri: playlistUri,
          offset: { position: 0 },  // 🔥 start from the first track
          position_ms: 0,           // 🔥 start from beginning of the track
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      console.log("Playlist should now be playing!");
    } catch (error) {
      console.error("Error trying to start playback:", error);
    }
  };
  
  

  return { player, isPaused, togglePlay, currentTrack, playlists, playPlaylist };
}
