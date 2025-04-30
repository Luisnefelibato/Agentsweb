import axios from 'axios';

// Configuración de endpoints
const API_CONFIG = {
  // En desarrollo, usamos el proxy de Vite para evitar problemas de CORS
  baseUrl: '/sunpich-api',
  endpoints: {
    chat: '/chat',                          
    speak: '/speak',                       
    status: '/status'                       
  },
  userName: 'William Mosquera',             // Nombre del usuario para las solicitudes
  timeout: 0,                               // Sin timeout (0 = ilimitado)
  retries: 3,                               // Número de reintentos para chat
  useBrowserTTS: true                       // Usar TTS del navegador como respaldo
};

// Función para reintento de solicitudes
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = API_CONFIG.retries, initialDelay = 2000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Reintento ${attempt + 1}/${maxRetries} después de ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await requestFn();
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido:`, error);
      lastError = error;
    }
  }
  
  throw lastError;
};

// Verificar el estado del API
export const checkApiStatus = async () => {
  try {
    // Intentamos una solicitud de chat simple para verificar
    await sendMessage("Hola");
    return true;
  } catch (error) {
    console.error('API de Sunpich no disponible:', error);
    return false;
  }
};

// Enviar mensaje (usando el formato correcto con user_name)
export const sendMessage = async (message: string, userName: string = API_CONFIG.userName) => {
  try {
    return await retryRequest(async () => {
      console.log('Enviando mensaje a Sunpich API:', { message, user_name: userName });
      const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.chat}`;
      
      const response = await axios.post(
        url, 
        { message, user_name: userName },  // Formato correcto con user_name
        { timeout: 0 }  // Sin timeout (0 = ilimitado)
      );
      
      console.log('Respuesta recibida de Sunpich API:', response.data);
      
      // La respuesta viene en response.data.response
      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        // Si viene en un formato directo como string
        if (typeof response.data === 'string') {
          return response.data;
        }
        // Si viene en otro formato
        return 'Recibí una respuesta, pero el formato no es el esperado.';
      }
    });
  } catch (error) {
    console.error('Error enviando mensaje a Sunpich API:', error);
    throw error;
  }
};

// Alternativa más simple usando solo SpeechSynthesis sin grabación
const generateSimpleBrowserTTS = (text: string): Promise<string> => {
  return new Promise((resolve) => {
    // Crear un identificador único para este audio
    const audioId = `tts-${Date.now()}`;
    
    // Almacenar el texto y el ID en un objeto global para referencia
    if (!(window as any).ttsStore) {
      (window as any).ttsStore = {};
    }
    
    (window as any).ttsStore[audioId] = {
      text,
      speak: () => {
        if (!('speechSynthesis' in window)) {
          console.error('Este navegador no soporta la API de síntesis de voz');
          return;
        }
        
        // Crear y configurar el utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz en español si está disponible
        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(voice => voice.lang.includes('es'));
        if (spanishVoice) {
          utterance.voice = spanishVoice;
        }
        
        // Configurar parámetros de voz
        utterance.rate = 1.0;  // Velocidad normal
        utterance.pitch = 1.0; // Tono normal
        utterance.volume = 1.0; // Volumen máximo
        
        // Iniciar la síntesis
        window.speechSynthesis.speak(utterance);
      }
    };
    
    // Devolver una URL especial que usaremos para identificar este audio
    resolve(`browser-tts://${audioId}`);
  });
};

// Obtener audio - Intenta desde el servidor y si falla, usa TTS del navegador
export const getAudioResponse = async (message: string, userName: string = API_CONFIG.userName) => {
  try {
    console.log('Solicitando audio para:', message);
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.speak}`;
    
    // Intentamos sin timeout
    const response = await axios.post(
      url, 
      { message, user_name: userName },  // Formato correcto con user_name
      { 
        responseType: 'blob',
        timeout: 0,  // Sin timeout (0 = ilimitado)
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg, */*'
        }
      }
    );
    
    // Si llegamos aquí, la solicitud fue exitosa
    console.log('Audio recibido correctamente, tipo:', response.data.type);
    return URL.createObjectURL(response.data);
  } catch (error: unknown) {
    // Si hay un error o el API no está disponible, usamos la síntesis del navegador
    if (API_CONFIG.useBrowserTTS) {
      // TypeScript seguro: verificar que error es un objeto y tiene una propiedad message
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.log('Usando TTS del navegador como alternativa debido a error:', errorMessage);
      try {
        return await generateSimpleBrowserTTS(message);
      } catch (ttsError) {
        console.error('Error generando TTS en el navegador:', ttsError);
        return null;
      }
    } else {
      console.error('Error obteniendo respuesta de audio:', error);
      return null;
    }
  }
};