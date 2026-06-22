import sys
import io
import os
from dotenv import load_dotenv

# Asegurar que las variables de entorno estén cargadas
load_dotenv()

from mirascope import llm
llm.register_provider(
    "openai",
    scope="groq/",
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ.get("GROQ_API_KEY", ""),
)

# Fix Windows charmap errors (emojis in user answers crash stdout)
os.environ['PYTHONIOENCODING'] = 'utf-8'
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import process_chat, process_fragrance_test
from agents.image_agent import process_image_edit

app = Flask(__name__)

# CORS
_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://eluxar-py.onrender.com")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# ── Chat ──────────────────────────────────────────────────────────────────────

@app.route('/chat', methods=['POST'])
@app.route('/ia/chat', methods=['POST'])
def chat_endpoint():
    data = request.json
    message = data.get('message')
    history = data.get('history', [])

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response_text, updated_history = asyncio.run(process_chat(message, history))
        return jsonify({
            "response": response_text,
            "history": updated_history
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        real = e.exceptions[0] if isinstance(e, BaseExceptionGroup) else e
        return jsonify({"error": str(real)}), 500

# ── Fragrance Test ────────────────────────────────────────────────────────────

@app.route('/fragrance-test', methods=['POST'])
@app.route('/ia/fragrance-test', methods=['POST'])
def fragrance_test_endpoint():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    step = data.get('step', 0)

    print(f"[API] /fragrance-test  step={step}  history_len={len(history)}  message={repr(message[:60])}")

    try:
        result = asyncio.run(process_fragrance_test(message, history, step))
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        real = e.exceptions[0] if isinstance(e, BaseExceptionGroup) else e
        return jsonify({"error": str(real)}), 500

# ── Image Editing ───────────────────────────────────────────────────────────────

@app.route('/edit-image', methods=['POST'])
def edit_image_endpoint():
    data = request.json
    
    image_base64 = data.get('image_base64')
    style = data.get('style', '')
    additional_prompt = data.get('additional_prompt', '')
    
    if not image_base64:
        return jsonify({"error": "No image_base64 provided"}), 400
        
    try:
        result = process_image_edit(image_base64, style, additional_prompt)
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
