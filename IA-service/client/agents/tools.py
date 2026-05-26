import sys
from mirascope import llm

def safe_print(text: str):
    """Print safely on Windows avoiding charmap errors with emoji/special chars."""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8'))

@llm.tool
def get_all_perfumes() -> str:
    """Obtiene el catálogo completo de perfumes disponibles en Eluxar."""
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
def get_perfumes_for_test() -> str:
    """Obtiene el catálogo completo de perfumes para el test olfativo."""
    pass
