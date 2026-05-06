import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAudioFromText, chatWithGemini } from '../services/apiService';
import { levaStore as store } from 'leva';
import { Mic, MicOff, Send } from 'lucide-react';
import "./bot.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// ── Prompt suggestion chips shown at the start ─────────────────────────────
const SUGGESTIONS = [
  { emoji: "📅", label: "Je veux programmer un meeting" },
  { emoji: "📧", label: "Je veux contacter Aro" },
  { emoji: "💼", label: "Parle-moi de tes services" },
  { emoji: "🛠️", label: "Tu peux automatiser quoi avec n8n ?" },
];

// ── Session ID persisté dans localStorage ──────────────────────────────────
function getOrCreateSessionId() {
  let id = localStorage.getItem("aro_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("aro_session_id", id);
  }
  return id;
}

export const TextToAudioGenerator = ({ onAudioGenerated }) => {
  const sessionId = useRef(getOrCreateSessionId());
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
      recognition.onend = () => setIsListening(false);
      recognition.start();
      setIsListening(true);
    }
  };

  // ── Core submit logic ─────────────────────────────────────────────────────
  const sendPrompt = useCallback(async (promptText) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage = promptText;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputPrompt("");
    setIsLoading(true);
    store.set({ playAudio: false });
    store.set({ isGenerating: true });

    try {
      // 1. Appel chat (historique géré par Supabase côté backend via session_id)
      const chatData = await chatWithGemini(userMessage, sessionId.current);
      const fullResponse = chatData.response;
      const action = chatData.action;

      // 2. Gestion popup calendar / email
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
      if (action && (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined')) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Pop-up bloquée. Ouvre manuellement : ${popupUrl}` },
        ]);
      }

      // 3. Génération audio
      const result = await generateAudioFromText(fullResponse);
      if (!result?.audio_base64) throw new Error("Audio non généré");

      // 4. Placeholder message pour la réponse (sera rempli par l'effet machine à écrire)
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      // 5. Démarrage audio
      if (onAudioGenerated) onAudioGenerated({ audioBase64: result.audio_base64 });
      window.dispatchEvent(new CustomEvent("audioGenerated", {
        detail: { audioBase64: result.audio_base64 },
      }));

      store.set({ isGenerating: false });

      // 6. Effet machine à écrire
      let assistantText = "";
      fullResponse.split("").forEach((char, index) => {
        setTimeout(() => {
          assistantText += char;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: assistantText };
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
  }, [isLoading, onAudioGenerated]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt(inputPrompt);
  };

  const handleSuggestion = (label) => {
    sendPrompt(label);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
        {/* ── Suggestions (visible uniquement si aucun message) ── */}
        <AnimatePresence>
          {messages.length === 0 && !isLoading && (
            <motion.div
              className="suggestions-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="suggestions-hint">Commence par une question 👇</p>
              <div className="suggestions-grid">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    className="suggestion-chip"
                    onClick={() => handleSuggestion(s.label)}
                    disabled={isLoading}
                  >
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages ── */}
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