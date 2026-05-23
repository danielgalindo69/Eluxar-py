import requests
import json
import sys
import io

# Configure standard streams for UTF-8 to handle emojis safely on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def test_agent():
    url = "http://localhost:5000/chat"
    payload = {
        "message": "Hola, ¿qué perfumes tienes disponibles que sean frescos o cítricos?",
        "history": []
    }
    
    print(f"Enviando mensaje al agente: {payload['message']}")
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            print("\n--- Respuesta del Agente ---")
            print(data.get("response"))
            print("\n--- Historial Actualizado ---")
            print(f"Mensajes en el historial: {len(data.get('history', []))}")
            
            # Verificar si hubo llamadas a herramientas (buscando el patrón en el historial)
            history = data.get("history", [])
            tool_calls = [m for m in history if "Llamando a" in str(m)]
            if tool_calls:
                print("\n✅ El agente utilizó herramientas MCP para consultar el catálogo.")
            else:
                print("\n⚠️ El agente respondió sin usar herramientas MCP. Revisa si tiene acceso al servidor.")
                
        else:
            print(f"Error: Status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error de conexión: {e}")

if __name__ == "__main__":
    test_agent()
