"""
Image editing agent — wraps the Clipdrop replace-background API.

Public API: process_image_edit(image_base64, style, additional_prompt) -> dict
"""

import base64
import io
import os

import requests
from PIL import Image

from config.ai_config import CLIPDROP_API_KEY
from utils.logger import get_logger

log = get_logger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
CLIPDROP_URL = "https://clipdrop-api.co/replace-background/v1"
CLIPDROP_TIMEOUT_SECONDS = 30
MAX_DECODED_BYTES = 10 * 1024 * 1024  # 10 MB after base64 decode


def process_image_edit(image_base64: str, style: str, additional_prompt: str) -> dict:
    """
    Decode a base64 image and call Clipdrop to replace its background.

    Args:
        image_base64:      Raw base64 string (with or without data-URI prefix).
        style:             Style descriptor, e.g. "elegante, oscuro".
        additional_prompt: Extra prompt text, e.g. "fondo de mármol".

    Returns:
        dict with keys ``edited_image_base64`` and ``original_image_base64``.

    Raises:
        ValueError:  If the decoded image exceeds MAX_DECODED_BYTES.
        RuntimeError: If Clipdrop returns a non-200 status.
    """
    # 1. Strip data-URI prefix if present.
    if image_base64.startswith("data:image"):
        image_base64 = image_base64.split(",", 1)[1]

    # 2. Decode and size-check.
    image_data = base64.b64decode(image_base64)
    if len(image_data) > MAX_DECODED_BYTES:
        raise ValueError(
            f"La imagen decodificada excede el límite de "
            f"{MAX_DECODED_BYTES // 1024 // 1024} MB."
        )

    # 3. Open with PIL and convert to PNG for the API.
    original_img = Image.open(io.BytesIO(image_data)).convert("RGBA")
    image_buffer = io.BytesIO()
    original_img.save(image_buffer, format="PNG")
    image_buffer.seek(0)

    # 4. Build prompt.
    parts = [p.strip() for p in [style, additional_prompt] if p.strip()]
    prompt_final = ", ".join(parts + ["professional perfume photography", "high quality", "studio lighting"])

    log.info("Calling Clipdrop API. prompt=%r", prompt_final[:80])

    # 5. Call Clipdrop.
    headers = {"x-api-key": CLIPDROP_API_KEY}
    files = {"image_file": ("image.png", image_buffer, "image/png")}
    data = {"prompt": prompt_final}

    response = requests.post(
        CLIPDROP_URL,
        headers=headers,
        files=files,
        data=data,
        timeout=CLIPDROP_TIMEOUT_SECONDS,
    )

    if response.status_code != 200:
        log.error("Clipdrop API error %d: %s", response.status_code, response.text[:200])
        raise RuntimeError(f"Error de Clipdrop API ({response.status_code}): {response.text}")

    log.info("Clipdrop API success. response_bytes=%d", len(response.content))

    # 6. Encode result.
    edited_b64 = base64.b64encode(response.content).decode("utf-8")

    # 7. Encode original (JPEG for size efficiency).
    original_buffer = io.BytesIO()
    original_img.convert("RGB").save(original_buffer, format="JPEG")
    init_b64 = base64.b64encode(original_buffer.getvalue()).decode("utf-8")

    return {
        "edited_image_base64": edited_b64,
        "original_image_base64": init_b64,
    }
