import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../directStyles.css';

interface MicrophoneButtonProps {
  onTranscriptReady: (transcript: string) => void;
}

const MicrophoneButton = ({ onTranscriptReady }: MicrophoneButtonProps) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Verifica si el navegador soporta la API de reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES'; // Reconocimiento en español
      
      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptResult = result[0].transcript;
        setTranscript(transcriptResult);
      };
      
      recognitionInstance.onend = () => {
        setListening(false);
        if (transcript) {
          onTranscriptReady(transcript);
          setTranscript('');
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.error('Tu navegador no soporta reconocimiento de voz');
    }
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [onTranscriptReady, transcript]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (!listening) {
      setTranscript('');
      recognition.start();
      setListening(true);
    } else {
      recognition.stop();
      setListening(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.button
        className={`mic-button ${listening ? 'listening' : ''}`}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        aria-label={listening ? 'Detener grabación' : 'Iniciar grabación'}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          style={{ height: '1.5rem', width: '1.5rem' }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
      </motion.button>
      
      {listening && (
        <motion.p 
          style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Escuchando...
        </motion.p>
      )}
      
      {transcript && (
        <motion.p 
          style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#9ca3af',
            maxWidth: '28rem',
            textAlign: 'center'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          "{transcript}"
        </motion.p>
      )}
    </div>
  );
};

export default MicrophoneButton;