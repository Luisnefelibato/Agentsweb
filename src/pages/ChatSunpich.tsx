import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MicrophoneButton from '../components/MicrophoneButton';
import AudioPlayer from '../components/AudioPlayer';
import { sendMessage } from '../services/sunpichApi';
import '../directStyles.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'sunpich';
  timestamp: string;
}

const ChatSunpich = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar el chat con un mensaje de bienvenida predeterminado
  useEffect(() => {
    // Agregar mensaje de bienvenida predeterminado
    setMessages([
      { 
        id: Date.now(), 
        text: "¡Hola William! Soy Sunpich, tu asistente innovador. ¿En qué proyecto o idea te puedo ayudar hoy?", 
        sender: 'sunpich', 
        timestamp: new Date().toLocaleTimeString() 
      }
    ]);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() && !e) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Agregar mensaje del usuario al chat
    setMessages(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        text: userMessage, 
        sender: 'user', 
        timestamp: new Date().toLocaleTimeString() 
      }
    ]);
    
    setIsLoading(true);
    
    try {
      // Obtener respuesta de Sunpich
      const response = await sendMessage(userMessage);
      
      // Agregar respuesta de Sunpich al chat
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: response, 
          sender: 'sunpich', 
          timestamp: new Date().toLocaleTimeString() 
        }
      ]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      
      // Agregar mensaje de error al chat
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Inténtalo de nuevo más tarde.', 
          sender: 'sunpich', 
          timestamp: new Date().toLocaleTimeString() 
        }
      ]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setInputMessage(transcript);
    
    // Pequeña pausa para que el usuario vea lo que se transcribió antes de enviar
    setTimeout(() => {
      handleSubmit();
    }, 500);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <Link to="/">
          <motion.button 
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </motion.button>
        </Link>
        
        <h1 className="chat-title">
          <img 
            src="https://placehold.co/50x50/blue/white?text=SP" 
            alt="Sunpich Avatar" 
            className="avatar"
          />
          Sunpich - Innovador
        </h1>
        
        <div style={{ width: '2.5rem' }}></div> {/* Spacer para centrar el título */}
      </header>
      
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className={`message-container ${message.sender === 'user' ? 'message-container-user' : 'message-container-agent'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-agent'}`}
            >
              <p>{message.text}</p>
              <span className="message-timestamp">{message.timestamp}</span>
              
              {message.sender === 'sunpich' && (
                <AudioPlayer audioUrl={null} text={message.text} />
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div 
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="message message-agent">
              <div className="loading-indicator">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="message-input"
            disabled={isLoading}
          />
          
          <motion.button
            type="submit"
            className="send-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
          
          <MicrophoneButton onTranscriptReady={handleVoiceInput} />
        </form>
      </div>
    </div>
  );
};

export default ChatSunpich;