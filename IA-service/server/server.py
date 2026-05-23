import json
import requests
from mcp.server.fastmcp import FastMCP

BACKEND_BASE = "http://localhost:8080/api"

# MCP Server Initialization
mcp = FastMCP("EluxarPerfumeServer")

# "Datos Quemados" (Mock Data) from the project frontend
MOCK_PERFUMES = [
    { "id": '1', "nombre": 'Acqua Di Gio', "tipo": 'EDT', "precioVenta": 95000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Fragancia fresca, marina y cítrica. Ideal para el día a día y la oficina.', "marca": 'Armani', "categoria": 'CABALLERO', "familiaOlfativa": 'Acuática', "stock": 10 },
    { "id": '2', "nombre": 'La Vie Est Belle', "tipo": 'EDP', "precioVenta": 120000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Perfume muy dulce, con notas de praliné, vainilla y flores. Perfecto para salidas de noche.', "marca": 'Lancome', "categoria": 'DAMA', "familiaOlfativa": 'Dulce', "stock": 5 },
    { "id": '3', "nombre": 'Sauvage Dior', "tipo": 'EDP', "precioVenta": 110000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Aroma amaderado y especiado. Muy versátil y masculino, proyecta mucha seguridad.', "marca": 'Dior', "categoria": 'CABALLERO', "familiaOlfativa": 'Amaderada', "stock": 8 },
    { "id": '4', "nombre": 'CK One', "tipo": 'EDT', "precioVenta": 50000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Aroma cítrico, ligero y unisex. Excelente para clima caluroso o gimnasio.', "marca": 'Calvin Klein', "categoria": 'UNISEX', "familiaOlfativa": 'Cítrica', "stock": 15 },
    { "id": '5', "nombre": 'Bleu de Chanel', "tipo": 'EDP', "precioVenta": 135000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Fragancia elegante, amaderada y cítrica. Perfecta para el hombre moderno, uso en oficina o eventos formales.', "marca": 'Chanel', "categoria": 'CABALLERO', "familiaOlfativa": 'Amaderada', "stock": 12 },
    { "id": '6', "nombre": 'Baccarat Rouge 540', "tipo": 'EDP', "precioVenta": 250000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Aroma lujoso de ámbar y madera. Unisex, dulce y extremadamente duradero. Llama la atención en eventos especiales.', "marca": 'Maison Francis Kurkdjian', "categoria": 'UNISEX', "familiaOlfativa": 'Ámbar', "stock": 3 },
    { "id": '7', "nombre": 'Black Orchid', "tipo": 'EDP', "precioVenta": 160000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Misteriosa, oscura y floral especiada. Unisex, ideal para personalidades atrevidas y noches frías.', "marca": 'Tom Ford', "categoria": 'UNISEX', "familiaOlfativa": 'Oriental', "stock": 7 },
    { "id": '8', "nombre": 'Coco Mademoiselle', "tipo": 'EDP', "precioVenta": 145000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Floral y oriental. Elegante, femenina y sofisticada. Versátil para el trabajo y citas románticas.', "marca": 'Chanel', "categoria": 'DAMA', "familiaOlfativa": 'Floral', "stock": 9 },
    { "id": '9', "nombre": 'YSL Y', "tipo": 'EDP', "precioVenta": 125000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Fresco, afrutado y con un toque de madera. Juvenil y energético, excelente para salidas nocturnas y uso casual.', "marca": 'Yves Saint Laurent', "categoria": 'CABALLERO', "familiaOlfativa": 'Aromática', "stock": 11 },
    { "id": '10', "nombre": 'Good Girl', "tipo": 'EDP', "precioVenta": 115000, "imagen": 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', "descripcion": 'Aroma seductor y dulce con notas de haba tonka y cacao. Perfecto para mujeres empoderadas en eventos nocturnos.', "marca": 'Carolina Herrera', "categoria": 'DAMA', "familiaOlfativa": 'Oriental', "stock": 14 }
]

@mcp.tool()
def get_all_perfumes() -> str:
    """Obtiene el catálogo de perfumes. Primero intenta el backend, si está vacío usa los datos de prueba."""
    try:
        resp = requests.get(f"{BACKEND_BASE}/productos", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        perfumes = data.get("data", []) if isinstance(data, dict) else data
        
        if not perfumes:
            print("\n[MCP] Backend vacío, usando datos quemados del proyecto.\n")
            return json.dumps(MOCK_PERFUMES, ensure_ascii=False)
            
        return json.dumps(perfumes, ensure_ascii=False)
    except Exception as e:
        print(f"\n[MCP] Error al conectar con backend ({e}), usando datos quemados.\n")
        return json.dumps(MOCK_PERFUMES, ensure_ascii=False)


@mcp.tool()
def get_perfume_by_id(id: str) -> str:
    """Obtiene los detalles de un perfume por su ID."""
    try:
        # Primero buscamos en los datos quemados
        perfume = next((p for p in MOCK_PERFUMES if str(p["id"]) == str(id)), None)
        if perfume:
            return json.dumps(perfume, ensure_ascii=False)
            
        # Si no está, intentamos el backend
        resp = requests.get(f"{BACKEND_BASE}/productos/{id}", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return json.dumps(data.get("data", data), ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": f"No se encontró el perfume {id}"})


@mcp.tool()
def search_perfumes_by_family(family: str) -> str:
    """Busca perfumes por familia olfativa."""
    # Filtrar en datos quemados
    results = [p for p in MOCK_PERFUMES if family.lower() in p["familiaOlfativa"].lower()]
    
    if results:
        print(f"\n[MCP] Encontrados {len(results)} en datos quemados para la familia '{family}'.\n")
        return json.dumps(results, ensure_ascii=False)
        
    # Si no hay resultados locales, intentar backend
    try:
        resp = requests.get(f"{BACKEND_BASE}/productos/buscar", params={"q": family}, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return json.dumps(data.get("data", []), ensure_ascii=False)
    except:
        return json.dumps([])


@mcp.tool()
def get_perfumes_for_test() -> str:
    """Obtiene el catálogo completo de perfumes para el test olfativo. Primero intenta el backend, si falla usa datos de prueba."""
    try:
        resp = requests.get(f"{BACKEND_BASE}/productos", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        perfumes = data.get("data", []) if isinstance(data, dict) else data

        if not perfumes:
            print("\n[MCP] Backend vacío para test olfativo, usando datos quemados.\n")
            return json.dumps(MOCK_PERFUMES, ensure_ascii=False)

        return json.dumps(perfumes, ensure_ascii=False)
    except Exception as e:
        print(f"\n[MCP] Error backend para test olfativo ({e}), usando datos quemados.\n")
        return json.dumps(MOCK_PERFUMES, ensure_ascii=False)


if __name__ == "__main__":
    mcp.run(transport="stdio")
