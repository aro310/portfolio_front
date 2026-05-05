import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateAudioFromText, chatWithGemini } from '../services/apiService';
import { levaStore as store } from 'leva';
import { Mic, MicOff, Send } from 'lucide-react';
import "./bot.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

export const TextToAudioGenerator = ({ onAudioGenerated }) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef(null);

  const toggleListening = () => {
    if (!recognition) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputPrompt((prev) => prev ? prev + " " + transcript : transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
  
    const userMessage = inputPrompt;
  
    // 1. Affichage immédiat du message user
    const baseMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(baseMessages);
  
    setInputPrompt("");
    setIsLoading(true);
  
    store.set({ playAudio: false });
    store.set({ isGenerating: true });
  
    try {
      // 2. Appel Gemini (texte complet) avec ses tools (Agenda, etc)
      const chatData = await chatWithGemini(userMessage);
      const fullResponse = chatData.response;
      const action = chatData.action;

      // 2.5 Gestion de la redirection (Popup)
      console.log("Action détectée :", action);
      let popupWindow = null;
      let popupType = "";
      let popupUrl = "";

      if (action === "open_calendar") {
          popupType = "Google Calendar";
          popupUrl = "https://calendar.google.com/calendar/u/0/r/day";
          popupWindow = window.open(popupUrl, "CalendarPopup", "width=1000,height=800");
      } else if (action === "open_email") {
          popupType = "Gmail";
          popupUrl = "https://mail.google.com/mail/u/0/#inbox";
          popupWindow = window.open(popupUrl, "EmailPopup", "width=1000,height=800");
      }

      if (action && (!popupWindow || popupWindow.closed || typeof popupWindow.closed == 'undefined')) {
          // Le bloqueur de popups a intercepté la fenêtre !
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ Votre navigateur a bloqué l'ouverture automatique de ${popupType}. Veuillez autoriser les pop-ups ou cliquer sur le lien: ${popupUrl}` },
          ]);
      }

      // 3. Génération audio
      const result = await generateAudioFromText(fullResponse);
  
      if (!result?.audio_base64) {
        throw new Error("Audio non généré");
      }
  
      let assistantText = "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);
  
      // 5. 🔥 DÉMARRAGE AUDIO (synchro)
      if (onAudioGenerated) {
        onAudioGenerated({ audioBase64: result.audio_base64 });
      }
      
      window.dispatchEvent(
        new CustomEvent("audioGenerated", {
          detail: { audioBase64: result.audio_base64 },
        })
      );
  
      store.set({ isGenerating: false });
  
      // 6. Effet machine à écrire
      const chars = fullResponse.split("");
      chars.forEach((char, index) => {
        setTimeout(() => {
          assistantText += char;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return copy;
          });
        }, index * 15);
      });
  
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Erreur : ${error.message}` },
      ]);
      store.set({ isGenerating: false });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading, inputPrompt]);

  return (
    <div className="chat-container">
      <motion.h2 
        className="chat-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Aro Assistant
      </motion.h2>

      <div className="chat-history" ref={chatRef}>
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
            initial={{ opacity: 0, x: msg.role === 'user' ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {msg.content}
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            className="chat-bubble assistant loading"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <span className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </motion.div>
        )}
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              className="chat-input"
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
            />
            <button 
              type="button" 
              onClick={toggleListening}
              className={`icon-btn ${isListening ? 'active-mic' : ''}`}
              title="Dicter"
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
          <motion.button
            type="submit"
            className="chat-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            ) : (
              <>Envoyer <Send size={18} /></>
            )}
          </motion.button>
        </form>
    </div>
  );
};