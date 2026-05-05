import google.generativeai as genai
import re

# ⚠️ Ne jamais exposer ta clé API publiquement
GOOGLE_API_KEY = "AIzaSyC15PyLpKjHZPRPmqdxS2LYzbZKYQPQWIE"
genai.configure(api_key=GOOGLE_API_KEY)

# Initialise le modèle Gemini
model = genai.GenerativeModel('gemma-3-27b-it')


def phonetic_transform(text: str) -> str:
    """Transforme le texte pour un rendu phonétique malagasy personnalisé."""
    transformations = [
        (r"mp", "mb"),    # mp → mb
        (r"Mp", "Mb"), 
        (r"tr", "tch"),   # tr → tch
        (r"Tr", "Tch"),   # majuscule
        (r"o", "ou"),     # o → ou
        (r"O", "Ou"),     # O → Ou
        (r"dr", "j"),     # dr → j
        (r"Dr", "J"),     # Dr → J
        (r"ts", "ch"),    # ts → ch
        (r"Ts", "Ch"),    # Ts → Ch
        (r"z", "s"),      # z → s
        (r"Z", "S"),      # Z → S
        (r"j", "dy"),     # j → dy (optionnel, pour sonorité)
        (r"J", "Dy"),
    ]

    result = text
    for pattern, repl in transformations:
        result = re.sub(pattern, repl, result)
    return result


def chat_with_gemini(prompt):
    try:
        # Contexte du modèle
        system_prompt = (
            "Aro dia assistant manampahaizana manokana amin’ny baolina kitra. "
            "Valio amin’ny teny malagasy fotsiny. "
            "Resaho foana ny momba ny baolina kitra ihany, "
            "aza miteny momba zavatra hafa. "
            "Valio amin’ny fehezanteny fohy sy mazava (1–3 fehezanteny). "
            "Aza manonona na manazava ny fomba fanoratanao."
        )

        full_prompt = f"{system_prompt}\n\nFanontaniana: {prompt}\n\nValiny:"

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=100,
            temperature=0.7,
        )

        # Réponse du modèle
        response = model.generate_content(
            full_prompt,
            generation_config=generation_config
        )

        text = response.text.strip()

        # Appliquer les transformations phonétiques
        transformed_text = phonetic_transform(text)

        return transformed_text

    except Exception as e:
        return f"Erreur: {e}"
