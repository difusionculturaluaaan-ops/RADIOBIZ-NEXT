/* eslint-disable react-hooks/exhaustive-deps */
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
  modifiedTime?: string;
}

type WakeLockSentinel = {
  release: () => Promise<void>;
};

export function useAudioPlayer(client: Client) {
  const musicRef = useRef<HTMLAudioElement>(null);
  const adRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // State
  const [playing, setPlaying] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [musicVolume, setMusicVolume] = useState(80);
  const [adVolume, setAdVolume] = useState(90);
  const [currentTrack, setCurrentTrack] = useState({
    name: 'Sin pista cargada',
    duration: 0,
    source: 'Selecciona una fuente',
  });
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nextAdSecs, setNextAdSecs] = useState(0);
  const [jingles, setJingles] = useState<DriveFile[]>([]);
  const [driveMusicFiles, setDriveMusicFiles] = useState<DriveFile[]>([]);
  const [sourceMode, setSourceMode] = useState<'mp3' | 'radio' | 'drive'>('mp3');
  const [adsToday, setAdsToday] = useState(0);

  // Refs for tracking state
  const jingleIndexRef = useRef(0);
  const curTrackRef = useRef(0);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ═══ SYNC JINGLES ═══
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

  // ═══ LOAD DRIVE MUSIC ═══
  const loadDriveMusic = useCallback(async (folderId?: string) => {
    const folderToLoad = folderId || client.musicfolder;
    if (!folderToLoad) return;

    try {
      const response = await fetch(`/api/drive/${folderToLoad}`);
      const data = await response.json();
      setDriveMusicFiles(data.files || []);
    } catch (error) {
      console.error('Error loading Drive music:', error);
    }
  }, [client.musicfolder]);

  // ═══ FADE OUT ═══
  const fadeOut = useCallback((callback: () => void) => {
    setIsFading(true);
    const secs = client.fade ?? 2;

    if (secs === 0 || !musicRef.current) {
      setIsFading(false);
      callback();
      return;
    }

    const steps = secs * 20;
    const initialVolume = musicRef.current.volume;
    const dec = initialVolume / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (musicRef.current) {
        musicRef.current.volume = Math.max(0, initialVolume - dec * step);
      }
      if (step >= steps) {
        clearInterval(timer);
        setIsFading(false);
        callback();
      }
    }, 50);
  }, [client.fade]);

  // ═══ FADE IN ═══
  const fadeIn = useCallback(() => {
    if (!musicRef.current) return;

    const secs = client.fade ?? 2;
    const targetVolume = musicVolume / 100;

    if (secs === 0) {
      musicRef.current.volume = targetVolume;
      return;
    }

    const steps = secs * 20;
    const inc = targetVolume / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (musicRef.current) {
        musicRef.current.volume = Math.min(targetVolume, step * inc);
      }
      if (step >= steps) {
        clearInterval(timer);
      }
    }, 50);
  }, [client.fade, musicVolume]);

  // ═══ PLAY AD (JINGLE) ═══
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
        // Increment ad counter
        setAdsToday((prev) => prev + 1);
      }
    });

    jingleIndexRef.current = (jingleIndexRef.current + 1) % jingles.length;
  }, [jingles, adVolume, fadeOut]);

  // ═══ SCHEDULE AD ═══
  const scheduleAd = useCallback(() => {
    if (adTimerRef.current) clearTimeout(adTimerRef.current);
    if (cdTimerRef.current) clearInterval(cdTimerRef.current);

    if (!playing) return;

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

  // ═══ TOGGLE PLAY ═══
  const togglePlay = useCallback(() => {
    if (!musicRef.current) return;

    if (playing) {
      musicRef.current.pause();
      setPlaying(false);
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
    } else {
      musicRef.current.play().catch(() => {});
      setPlaying(true);
      scheduleAd();
    }
  }, [playing, scheduleAd]);

  // ═══ NEXT TRACK ═══
  const nextTrack = useCallback(() => {
    if (sourceMode !== 'drive' || driveMusicFiles.length === 0) return;

    curTrackRef.current = (curTrackRef.current + 1) % driveMusicFiles.length;
    const file = driveMusicFiles[curTrackRef.current];

    if (musicRef.current) {
      musicRef.current.src = `/api/drive/stream/${file.id}`;
      if (playing) {
        musicRef.current.play().catch(() => {});
      }
    }
  }, [sourceMode, driveMusicFiles, playing]);

  // ═══ PREVIOUS TRACK ═══
  const previousTrack = useCallback(() => {
    if (sourceMode !== 'drive' || driveMusicFiles.length === 0) return;

    curTrackRef.current = (curTrackRef.current - 1 + driveMusicFiles.length) % driveMusicFiles.length;
    const file = driveMusicFiles[curTrackRef.current];

    if (musicRef.current) {
      musicRef.current.src = `/api/drive/stream/${file.id}`;
      if (playing) {
        musicRef.current.play().catch(() => {});
      }
    }
  }, [sourceMode, driveMusicFiles, playing]);

  // ═══ WAKE LOCK ═══
  useEffect(() => {
    if (playing && 'wakeLock' in navigator) {
      (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock
        .request('screen')
        .then((wl: WakeLockSentinel) => {
          wakeLockRef.current = wl;
        })
        .catch(() => {});
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }
  }, [playing]);

  // ═══ UPDATE VOLUME ═══
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

  // ═══ TRACK PROGRESS & METADATA ═══
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
        const fileName = audio.src.split('/').pop() || 'Reproduciendo';
        const sourceLabel =
          sourceMode === 'radio' ? 'Radio online' : sourceMode === 'drive' ? 'Desde Drive' : 'Archivo local';
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

  // ═══ SYNC JINGLES ON MOUNT & PERIODICALLY ═══
  useEffect(() => {
    if (client.folder) {
      void syncJingles();
      const interval = setInterval(() => {
        void syncJingles();
      }, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [client.folder, syncJingles]);

  // ═══ LOAD DRIVE MUSIC ON MOUNT ═══
  useEffect(() => {
    if (client.musicfolder) {
      void loadDriveMusic();
    }
  }, [client.musicfolder, loadDriveMusic]);

  // ═══ AD ENDED HANDLER ═══
  useEffect(() => {
    const ad = adRef.current;
    if (!ad) return;

    const handleAdEnded = () => {
      setAdPlaying(false);
    };

    ad.addEventListener('ended', handleAdEnded);
    return () => ad.removeEventListener('ended', handleAdEnded);
  }, []);

  // ═══ CLEANUP TIMERS ═══
  useEffect(() => {
    return () => {
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
      if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    };
  }, []);

  return {
    // Refs
    musicRef,
    adRef,
    // State
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
    driveMusicFiles,
    sourceMode,
    isFading,
    adsToday,
    // Methods
    togglePlay,
    playAd,
    scheduleAd,
    syncJingles,
    fadeOut,
    fadeIn,
    nextTrack,
    previousTrack,
    loadDriveMusic,
    // Unified volume setter (for backward compat)
    setVolume: setMusicVolume,
  };
}
