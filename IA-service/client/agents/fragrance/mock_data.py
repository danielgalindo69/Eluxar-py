"""
Datos de Respaldo (Fallback) para el Test Olfativo.
"""
MOCK_QUESTIONS: list[dict] = [
    {
        "question": "¿Cuál de estos aromas te atrae más?",
        "options": ["Floral", "Amaderado", "Cítrico", "Dulce"],
    },
    {
        "question": "¿Para qué ocasión buscas el perfume?",
        "options": ["Día a día", "Eventos formales", "Citas románticas", "Deporte / Fresco"],
    },
    {
        "question": "¿Qué intensidad prefieres?",
        "options": ["Suave y discreto", "Moderado", "Fuerte y llamativo", "Muy intenso"],
    },
    {
        "question": "¿En qué clima lo usarías más?",
        "options": ["Calor / Verano", "Frío / Invierno", "Templado", "Ambientes cerrados"],
    },
    {
        "question": "¿Qué nota prefieres que destaque?",
        "options": ["Vainilla / Caramelo", "Rosas / Jazmín", "Limón / Bergamota", "Cedro / Sándalo"],
    },
    {
        "question": "¿Cómo describirías tu estilo?",
        "options": ["Elegante", "Deportivo", "Seductor", "Extrovertido"],
    },
    {
        "question": "¿Qué presupuesto aproximado tienes?",
        "options": ["Económico", "Medio", "Premium", "Lujo"],
    },
]

TOTAL_QUESTIONS: int = 7

FALLBACK_RECOMMENDATION: str = """
**TU FRAGANCIA IDEAL**
────────────────────────

**Perfume Sorpresa** — Eluxar
Tipo: EDP
Familia: Especial
Precio: **Consultar catálogo** COP

────────────────────────

**¿Por qué es perfecta para ti?**
Basandonos en tus respuestas, este perfume tiene exactamente lo que buscas.
Hemos tenido un problema temporal de conexión con el Asistente de IA,
pero te invitamos a explorar nuestro catálogo para encontrar tus notas favoritas.

**Tip de uso:** Aplica en los puntos de pulso para mayor duración.
"""
