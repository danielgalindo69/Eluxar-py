"""
Definición de las Herramientas (Tools) del lado del Cliente (Mirascope).
"""
from mirascope import llm


@llm.tool
def get_all_perfumes(limit: str = "50") -> str:
    """Obtiene el catálogo completo de perfumes disponibles en Eluxar.

    Args:
        limit: Límite opcional de resultados.
    """
    pass


@llm.tool
def get_perfume_by_id(id: int) -> str:
    """Obtiene los detalles completos de un perfume específico por su ID.

    Args:
        id: El identificador numérico del perfume (e.g. 1, 2, 3).
    """
    pass


@llm.tool
def search_perfumes_by_family(family: str) -> str:
    """Busca perfumes por familia olfativa (e.g. 'Floral', 'Amaderada', 'Oriental', 'Cítrica').

    Args:
        family: El nombre de la familia olfativa a buscar.
    """
    pass


@llm.tool
def get_perfumes_for_test(limit: str = "50") -> str:
    """Obtiene el catálogo completo de perfumes para el test olfativo.

    Args:
        limit: Límite opcional de resultados.
    """
    pass
