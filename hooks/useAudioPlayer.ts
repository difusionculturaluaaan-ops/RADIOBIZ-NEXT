/* eslint-disable react-hooks/set-state-in-effect */
import { useRef, useState, useEffect, useCallback } from 'react';

interface Client {
  id: string;
  name: string;
  folder: string;
  musicfolder?: string;
  radio?: string;
  pin: string;
  intervalo: number;
  fade?: number;
  code: string;
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

type WakeLockSentinel = {
  release: () => Promise<void>;
};

export function useAudioPlayer(client: Client) {
  const musicRef = useRef<HTMLAudioElement>(null);
  const adRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const [playing, setPlaying] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(80);
  const [adVolume, setAdVolume] = useState(90);
  const [currentTrack, setCurrentTrack] = useState({ name: 'Sin pista cargada', duration: 0, source: 'Selecciona una fuente' });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nextAdSecs, setNextAdSecs] = useState(0);
  const [jingles, setJingles] = useState<DriveFile[]>([]);
  const [sourceMode, setSourceMode] = useState<'radio' | 'drive' | 'local'>('local');
  const [isFading, setIsFading] = useState(false);
  const [adsToday, setAdsToday] = useState(0);

  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const jingleIndexRef = useRef(0);

  // Cargar música según sourceMode
  const loadMusic = useCallback(async () => {
    if (!musicRef.current) return;

    if (client.radio) {
      musicRef.current.src = client.radio;
      setSourceMode('radio');
      return;
    }

    if (client.musicfolder) {
      try {
        const response = await fetch(`/api/drive/${client.musicfolder}`);
        const data = await response.json();
        const files = data.files || [];
        if (files.length > 0) {
          const randomFile = files[Math.floor(Math.random() * files.length)];
          musicRef.current.src = `/api/drive/stream/${randomFile.id}`;
          setSourceMode('drive');
        }
      } catch (error) {
        console.error('Error loading music:', error);
      }
    }
  }, [client]);

  // Fade out
  const fadeOut = useCallback((callback: () => void) => {
    setIsFading(true);
    const secs = client.fade ?? 2;
    if (secs === 0) {
      setIsFading(false);
      callback();
      return;
    }

    if (!musicRef.current) {
      setIsFading(false);
      callback();
      return;
    }

    const steps = secs * 20;
    const dec = musicRef.current.volume / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (musicRef.current) {
        musicRef.current.volume = Math.max(0, musicRef.current.volume - dec);
      }
      if (step >= steps) {
        clearInterval(timer);
        setIsFading(false);
        callback();
      }
    }, 50);
  }, [client.fade]);

  // Fade in
  const fadeIn = useCallback(() => {
    if (!musicRef.current) return;
    const secs = client.fade ?? 2;
    if (secs === 0) {
      musicRef.current.volume = musicVolume / 100;
      return;
    }

    const targetVolume = musicVolume / 100;
    const steps = secs * 20;
    const inc = targetVolume / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (musicRef.current) {
        musicRef.current.volume = Math.min(targetVolume, musicRef.current.volume + inc);
      }
      if (step >= steps) {
        clearInterval(timer);
      }
    }, 50);
  }, [client.fade, musicVolume]);

  // Reproducir anuncio/jingle
  const playAd = useCallback(async () => {
    if (jingles.length === 0) return;

    const jingle = jingles[jingleIndexRef.current % jingles.length];
    if (!adRef.current) return;

    fadeOut(() => {
      if (musicRef.current) {
        musicRef.current.pause();
      }
      if (adRef.current) {
        adRef.current.src = `/api/drive/stream/${jingle.id}`;
        adRef.current.volume = adVolume / 100;
        adRef.current.play().catch(() => {});
        setAdPlaying(true);
        // Increment ads counter
        setAdsToday((prev) => prev + 1);
      }
    });

    jingleIndexRef.current = (jingleIndexRef.current + 1) % jingles.length;
  }, [jingles, adVolume, fadeOut]);

  // Programar anuncio
  const scheduleAd = useCallback(() => {
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    if (cdTimerRef.current) clearInterval(cdTimerRef.current);

    const intervalMs = (client.intervalo || 10) * 60 * 1000;
    const nextAdAt = Date.now() + intervalMs;

    adTimerRef.current = setTimeout(() => {
      if (playing) {
        playAd();
      }
    }, intervalMs);

    cdTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, nextAdAt - Date.now());
      const secs = Math.floor(remaining / 1000);
      setNextAdSecs(secs);
    }, 500);
  }, [client.intervalo, playing, playAd]);

  // Sincronizar jingles desde Drive
  const syncJingles = useCallback(async () => {
    if (!client.folder) return;
    try {
      const response = await fetch(`/api/drive/${client.folder}`);
      const data = await response.json();
      setJingles(data.files || []);
    } catch (error) {
      console.error('Error syncing jingles:', error);
    }
  }, [client.folder]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!musicRef.current) return;

    if (playing) {
      musicRef.current.pause();
      setPlaying(false);
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
    } else {
      loadMusic();
      musicRef.current.play().catch(() => {});
      setPlaying(true);
      scheduleAd();
    }
  }, [playing, loadMusic, scheduleAd]);

  // Wake lock
  useEffect(() => {
    if (playing && 'wakeLock' in navigator) {
      (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen').then((wl: WakeLockSentinel) => {
        wakeLockRef.current = wl;
      }).catch(() => {});
    } else {
      wakeLockRef.current?.release();
    }
  }, [playing]);

  // Update volume on musicRef and adRef
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (adRef.current) {
      adRef.current.volume = adVolume / 100;
    }
  }, [adVolume]);

  // Track progress and metadata
  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const updateMetadata = () => {
      setDuration(audio.duration || 0);
      if (audio.src) {
        // Extract filename from URL or use default
        const fileName = audio.src.split('/').pop() || 'Reproduciendo';
        const sourceLabel = sourceMode === 'radio' ? 'Radio online' : sourceMode === 'drive' ? 'Desde Drive' : 'Archivo local';
        setCurrentTrack({
          name: fileName,
          duration: audio.duration || 0,
          source: sourceLabel,
        });
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateMetadata);
    audio.addEventListener('play', updateMetadata);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateMetadata);
      audio.removeEventListener('play', updateMetadata);
    };
  }, [sourceMode]);

  // Sincronizar jingles al montar y periódicamente
  useEffect(() => {
    if (client.folder) {
      void syncJingles();
      const interval = setInterval(() => {
        void syncJingles();
      }, 2 * 60 * 1000); // Sync every 2 minutes
      return () => clearInterval(interval);
    }
  }, [client.folder, syncJingles]);

  // Next and previous track
  const nextTrack = useCallback(() => {
    if (sourceMode === 'drive' && musicFiles.length > 0) {
      const next = (curTrack + 1) % musicFiles.length;
      // Implementar cambio de track
    }
  }, [sourceMode, musicFiles, curTrack]);

  const previousTrack = useCallback(() => {
    if (sourceMode === 'drive' && musicFiles.length > 0) {
      const prev = (curTrack - 1 + musicFiles.length) % musicFiles.length;
      // Implementar cambio de track
    }
  }, [sourceMode, musicFiles, curTrack]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
      if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    };
  }, []);

  return {
    musicRef,
    adRef,
    playing,
    adPlaying,
    musicVolume,
    setMusicVolume,
    adVolume,
    setAdVolume,
    currentTrack,
    progress,
    currentTime,
    duration,
    nextAdSecs,
    jingles,
    sourceMode,
    isFading,
    adsToday,
    togglePlay,
    playAd,
    scheduleAd,
    syncJingles,
    fadeOut,
    fadeIn,
    nextTrack,
    previousTrack,
  };
}
