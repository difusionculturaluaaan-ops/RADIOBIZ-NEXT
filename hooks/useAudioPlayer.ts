import { useRef, useState, useEffect, useCallback } from 'react';
import { ref, get, set, onValue, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

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

export function useAudioPlayer(client: Client) {
  const musicRef = useRef<HTMLAudioElement>(null);
  const adRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTrack, setCurrentTrack] = useState({ name: '...', duration: '0:00' });
  const [progress, setProgress] = useState(0);
  const [nextAdSecs, setNextAdSecs] = useState(0);
  const [jingles, setJingles] = useState<DriveFile[]>([]);
  const [sourceMode, setSourceMode] = useState<'radio' | 'drive' | 'local'>('local');

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
    const secs = client.fade ?? 2;
    if (secs === 0) {
      callback();
      return;
    }

    if (!musicRef.current) {
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
        callback();
      }
    }, 50);
  }, [client.fade]);

  // Fade in
  const fadeIn = useCallback(() => {
    if (!musicRef.current) return;
    const secs = client.fade ?? 2;
    if (secs === 0) return;

    const targetVolume = volume / 100;
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
  }, [client.fade, volume]);

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
        adRef.current.volume = volume / 100;
        adRef.current.play().catch(() => {});
        setAdPlaying(true);
      }
    });

    jingleIndexRef.current = (jingleIndexRef.current + 1) % jingles.length;
  }, [jingles, volume, fadeOut]);

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
      (navigator as any).wakeLock.request('screen').then((wl: any) => {
        wakeLockRef.current = wl;
      }).catch(() => {});
    } else {
      wakeLockRef.current?.release();
    }
  }, [playing]);

  // Update volume on musicRef
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Track progress and metadata
  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const updateMetadata = () => {
      if (audio.src) {
        // Extract filename from URL or use default
        const fileName = audio.src.split('/').pop() || 'Reproduciendo';
        setCurrentTrack({
          name: fileName,
          duration: audio.duration ? `${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}` : '0:00',
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
  }, []);

  // Sincronizar jingles al montar
  useEffect(() => {
    syncJingles();
    const interval = setInterval(syncJingles, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncJingles]);

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
    volume,
    setVolume,
    currentTrack,
    progress,
    nextAdSecs,
    jingles,
    sourceMode,
    togglePlay,
    playAd,
    scheduleAd,
    syncJingles,
    fadeOut,
    fadeIn,
  };
}
