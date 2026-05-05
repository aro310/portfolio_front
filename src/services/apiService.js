// src/services/apiService.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001';
const API_URL_SCRIPT  = `${API_BASE}/api/run-script`;
const API_URL_CHAT    = `${API_BASE}/api/chat`;
const API_URL_CONTACT = `${API_BASE}/api/contact`;

export const generateAudioFromText = async (text) => {
  const response = await fetch(API_URL_SCRIPT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texte: text }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Une erreur est survenue.');
  }
  return response.json();
};

export const chatWithGemini = async (prompt) => {
  const response = await fetch(API_URL_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Erreur lors du chat avec Gemini.');
  }
  return response.json();
};

export const sendContactForm = async ({ name, email, message }) => {
  const response = await fetch(API_URL_CONTACT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Erreur envoi message.');
  }
  return response.json();
};