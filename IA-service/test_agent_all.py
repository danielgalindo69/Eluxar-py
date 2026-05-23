import requests
import json

def test_agent_all():
    url = "http://localhost:5000/chat"
    payload = {
        "message": "Haz una lista de todos los perfumes que tienes en el catálogo.",
        "history": []
    }
    
    print(f"Enviando mensaje al agente: {payload['message']}")
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            data = response.json()
            print("\n--- Respuesta del Agente ---")
            print(data.get("response"))
            print("\n--- Historial ---")
            for msg in data.get("history", []):
                role = msg.get("role")
                text = msg.get("parts", [{}])[0].get("text", "")
                print(f"[{role}]: {text[:100]}...")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_agent_all()
