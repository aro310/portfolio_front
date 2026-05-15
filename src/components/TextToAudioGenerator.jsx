import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAudioFromText, chatWithGemini } from '../services/apiService';
import { levaStore as store } from 'leva';
import { Mic, MicOff, Send } from 'lucide-react';
import "./bot.css";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// ── Session ID — persisté dans localStorage pour charger l'historique Supabase ──
// Reset explicite quand l'utilisateur ferme et réouvre le widget.
function getOrCreateSessionId() {
  let id = localStorage.getItem("aro_chat_session");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("aro_chat_session", id);
  }
  return id;
}

function clearSession() {
  localStorage.removeItem("aro_chat_session");
}

export const TextToAudioGenerator = ({ onAudioGenerated, onRequestClose }) => {
  const sessionId = useRef(getOrCreateSessionId()); // persisted in localStorage

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef(null);
  const isFirstMessage = useRef(true); // track if this is the first exchange

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
      // 1. Chat — always runs, must succeed
      const chatData = await chatWithGemini(userMessage, sessionId.current);
      const fullResponse = chatData.response || "";
      const action = chatData.action;

      // 2. Action popups (calendar / email)
      let popupUrl = "";
      if (action === "open_calendar") {
        popupUrl = "https://calendar.google.com/calendar/u/0/r/day";
        const w = window.open(popupUrl, "CalendarPopup", "width=1000,height=800");
        if (!w) setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Pop-up bloquée. Ouvre manuellement : ${popupUrl}` }]);
      } else if (action === "open_email") {
        popupUrl = "https://mail.google.com/mail/u/0/#inbox";
        const w = window.open(popupUrl, "EmailPopup", "width=1000,height=800");
        if (!w) setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Pop-up bloquée. Ouvre manuellement : ${popupUrl}` }]);
      }

      // 3. Always show text response (typewriter effect)
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      store.set({ isGenerating: false });

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

      // 4. Audio — optional, silent fallback if it fails
      try {
        const result = await generateAudioFromText(fullResponse);
        if (result?.audio_base64) {
          if (onAudioGenerated) onAudioGenerated({ audioBase64: result.audio_base64 });
          window.dispatchEvent(new CustomEvent("audioGenerated", {
            detail: { audioBase64: result.audio_base64 },
          }));
        }
        // If no audio_base64, backend returned gracefully with no audio — silent mode
      } catch (audioErr) {
        // Audio failed — log quietly to console only, DO NOT show in chat
        console.warn("[Audio] ElevenLabs unavailable, text-only mode:", audioErr.message);
      }

    } catch (error) {
      // Only chat errors show in the UI (brief, friendly message)
      console.error("[Chat] Error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "❌ Une erreur est survenue. Veuillez réessayer.",
      }]);
      store.set({ isGenerating: false });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onAudioGenerated]);

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt(inputPrompt);
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
        {/* ── Empty state hint ── */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            className="chat-empty-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span>💬</span> Pose ta première question !
          </motion.div>
        )}

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