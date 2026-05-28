# ── IA-Service Dockerfile ───────────────────────────────────────────────────
# Imagen base ligera de Python 3.11
FROM python:3.11-slim

WORKDIR /app

# Instalamos dependencias del sistema necesarias para compilar paquetes (ej: mcp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ── 1. Instalar dependencias del CLIENT (Flask API) ──────────────────────────
COPY client/requirements.txt ./client/requirements.txt
RUN pip install --no-cache-dir -r client/requirements.txt

# ── 2. Instalar dependencias del SERVER (MCP) ────────────────────────────────
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt

# ── 3. Copiar el código fuente ────────────────────────────────────────────────
COPY client/ ./client/
COPY server/ ./server/

# Puerto dinámico (Render lo inyecta via la variable de entorno PORT)
EXPOSE 5000

# ── 4. Arranque con Gunicorn (producción) ────────────────────────────────────
# Usamos sh -c para que $PORT se expanda desde las variables de entorno de Render
WORKDIR /app/client
CMD sh -c "gunicorn --bind 0.0.0.0:${PORT:-5000} --timeout 120 --workers 1 api:app"
