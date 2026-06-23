"""
Archivo de compatibilidad.
Redirige la antigua importación del test de fragancias hacia el nuevo orquestador
para mantener la compatibilidad hacia atrás y no romper otras partes del código.
"""
from agents.fragrance.orchestrator import process_fragrance_test  # noqa: F401

__all__ = ["process_fragrance_test"]
