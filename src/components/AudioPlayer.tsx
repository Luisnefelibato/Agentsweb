import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../directStyles.css';

interface AudioPlayerProps {
  audioUrl: string | null;
}

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBrowserTTS, setIsBrowserTTS] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estado para controlar la reproducción de TTS
  const ttsTimer = useRef<number | null>(null);  // Usando number en lugar de NodeJS.Timeout
  const ttsAudioId = useRef<string | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    // Detectar si es una URL de TTS del navegador
    if (audioUrl.startsWith('browser-tts://')) {
      setIsBrowserTTS(true);
      ttsAudioId.current = audioUrl.replace('browser-tts://', '');
      
      // Si hay un TTS anterior reproduciéndose, lo detenemos
      if (ttsTimer.current !== null) {
        clearTimeout(ttsTimer.current);
        ttsTimer.current = null;
        window.speechSynthesis?.cancel();
      }
      
      // Simular duración para TTS (10 segundos por defecto)
      setDuration(10);
      setCurrentTime(0);
      
      // Reproducir automáticamente el TTS
      playBrowserTTS();
    } else {
      // Es un audio normal
      setIsBrowserTTS(false);
      
      if (audioRef.current) {
        audioRef.current.load();
        // Reproducir automáticamente cuando se carga un nuevo audio
        audioRef.current.play().catch(e => console.error('Error reproduciendo audio:', e));
      }
    }
  }, [audioUrl]);

  useEffect(() => {
    // Limpieza al desmontar
    return () => {
      if (ttsTimer.current !== null) {
        clearTimeout(ttsTimer.current);
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isBrowserTTS) return; // No aplicar estos efectos para TTS
    
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Eventos del elemento de audio
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isBrowserTTS]);

  // Funciones para manejar el TTS del navegador
  const playBrowserTTS = () => {
    if (!isBrowserTTS || !ttsAudioId.current) return;
    
    // Obtener el almacén TTS global
    const ttsStore = (window as any).ttsStore || {};
    const ttsData = ttsStore[ttsAudioId.current];
    
    if (!ttsData) {
      console.error('No se encontró el audio TTS:', ttsAudioId.current);
      return;
    }
    
    // Reproducir el TTS
    ttsData.speak();
    setIsPlaying(true);
    
    // Simular progreso de reproducción
    const updateInterval = 100; // 100ms
    let elapsed = 0;
    
    // Cancelar cualquier temporizador existente
    if (ttsTimer.current !== null) {
      clearInterval(ttsTimer.current);
    }
    
    ttsTimer.current = window.setInterval(() => {
      elapsed += updateInterval / 1000;
      setCurrentTime(elapsed);
      
      // Simular finalización cuando se alcanza la duración
      if (elapsed >= duration) {
        if (ttsTimer.current !== null) {
          clearInterval(ttsTimer.current);
          ttsTimer.current = null;
        }
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, updateInterval);
  };

  const pauseBrowserTTS = () => {
    if (!isBrowserTTS) return;
    
    // Pausar la síntesis de voz
    window.speechSynthesis?.pause();
    
    // Pausar el temporizador
    if (ttsTimer.current !== null) {
      clearInterval(ttsTimer.current);
      ttsTimer.current = null;
    }
    
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isBrowserTTS) {
      if (isPlaying) {
        pauseBrowserTTS();
      } else {
        playBrowserTTS();
      }
      return;
    }
    
    // Manejo normal para audio estándar
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error('Error reproduciendo audio:', e));
    }
  };

  if (!audioUrl) return null;

  return (
    <motion.div 
      className="audio-player"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!isBrowserTTS && (
        <audio ref={audioRef} className="hidden">
          <source src={audioUrl} type="audio/mpeg" />
          Tu navegador no soporta el elemento de audio.
        </audio>
      )}

      <button 
        onClick={togglePlayPause}
        className="player-button"
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ height: '1.5rem', width: '1.5rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ height: '1.5rem', width: '1.5rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>

      <div className="time-display">
        {isBrowserTTS ? (
          isPlaying ? 'TTS' : 'Voz'
        ) : (
          duration ? `${Math.floor(currentTime)}s` : '...'
        )}
      </div>
    </motion.div>
  );
};

export default AudioPlayer;