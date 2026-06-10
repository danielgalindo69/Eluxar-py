import base64
import os
import io
import requests
from PIL import Image
from dotenv import load_dotenv

# Forzar ruta absoluta del .env
basedir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(basedir, '..', '.env')
load_dotenv(dotenv_path=dotenv_path, override=True)

def process_image_edit(image_base64: str, style: str, additional_prompt: str) -> dict:
    """
    Decodifica la imagen en Base64 y llama a la API de Clipdrop para reemplazar el fondo.
    """
    # 1. Decodificar base64 a imagen PIL
    if image_base64.startswith('data:image'):
        image_base64 = image_base64.split(',', 1)[1]
    
    image_data = base64.b64decode(image_base64)
    original_img = Image.open(io.BytesIO(image_data)).convert("RGBA")
    
    # 2. Convertir imagen original a bytes para enviarla
    image_buffer = io.BytesIO()
    original_img.save(image_buffer, format="PNG")
    image_buffer.seek(0)
    
    # 3. Preparar prompt
    prompt_final = f"{style}, {additional_prompt}, professional perfume photography, high quality, studio lighting".strip(", ")
    
    # 4. Llamar a Clipdrop API
    url = "https://clipdrop-api.co/replace-background/v1"
    api_key = os.environ.get("CLIPDROP_API_KEY", "")
    
    if not api_key or api_key == "tu_key_aqui":
        raise Exception("CLIPDROP_API_KEY no configurada en el .env de Python")
        
    headers = {
        "x-api-key": api_key
    }
    
    files = {
        "image_file": ("image.png", image_buffer, "image/png"),
    }
    
    data = {
        "prompt": prompt_final
    }
    
    response = requests.post(url, headers=headers, files=files, data=data)
    
    if response.status_code != 200:
        raise Exception(f"Error de Clipdrop API: {response.text}")
        
    # Clipdrop devuelve la imagen en crudo como binario (image/png o image/jpeg)
    edited_b64 = base64.b64encode(response.content).decode("utf-8")
    
    # Retornar imagen original a base64 (si React la necesita en la respuesta)
    original_buffer = io.BytesIO()
    original_img.convert("RGB").save(original_buffer, format="JPEG")
    init_b64 = base64.b64encode(original_buffer.getvalue()).decode("utf-8")
    
    return {
        "edited_image_base64": edited_b64,
        "original_image_base64": init_b64
    }
