import sys
import io
import os

# Fix Windows charmap errors (emojis in user answers crash stdout)
# Must run before any import that triggers output
os.environ['PYTHONIOENCODING'] = 'utf-8'
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    # Fallback for older Python / edge cases
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import asyncio
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import process_chat, process_fragrance_test

app = Flask(__name__)
CORS(app)


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.route('/chat', methods=['POST'])
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
        return jsonify({"error": str(e)}), 500


# ── Fragrance Test ────────────────────────────────────────────────────────────

@app.route('/fragrance-test', methods=['POST'])
def fragrance_test_endpoint():
    data = request.json

    message = data.get('message', '')
    # history accumulates Q&A pairs: [{"question": "...", "answer": "..."}, ...]
    # It is sent back by the frontend on every step, growing with each question.
    history = data.get('history', [])
    step = data.get('step', 0)

    print(f"[API] /fragrance-test  step={step}  history_len={len(history)}  message={repr(message[:60])}")

    try:
        result = asyncio.run(process_fragrance_test(message, history, step))
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    port = int(os.environ.get("PORT", 5000))
    app.run(port=port, debug=True)
