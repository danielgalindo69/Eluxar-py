import { apiClient, formatPrice } from './client';
import { Product } from '../../features/products/types/products';

// ─── Mappers ─────────────────────────────────────────────────
// Mapeo de CategoriaEnum del backend al campo gender del frontend
const mapCategoriaToGender = (categoria: string): Product['gender'] => {
  switch (categoria?.toUpperCase()) {
    case 'CABALLERO': return 'Masculino';
    case 'DAMA':      return 'Femenino';
    case 'NINO':      return 'Niño';
    case 'NINA':      return 'Niña';
    default:          return 'Unisex';
  }
};

export const mapProductoDTOToProduct = (dto: any): Product => {
  const principalImage = dto.imagenes?.find((img: any) => img.principal)?.url || dto.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080';
  const hoverImage = dto.imagenes?.filter((img: any) => !img.principal)?.[0]?.url;

  return {
    id: String(dto.id),
    name: dto.nombre || '',
    type: dto.familiaOlfativa || dto.categoria || '',  // muestra familia olfativa como tipo
    price: `${formatPrice(dto.variantes?.[0]?.precioVenta || 0)} COP`,
    image: principalImage,
    hoverImage: hoverImage,
    description: dto.descripcion || '',
    brand: dto.marca || 'Eluxar',
    gender: mapCategoriaToGender(dto.categoria),
    olfactoryFamily: dto.familiaOlfativa || '',
    category: dto.categoria || '',
    variants: (dto.variantes || []).map((v: any) => ({
      id: v.id,
      volume: `${v.tamanoMl}ml`,
      price: v.precioVenta,
      stock: v.stockActual
    })),
    stock: (dto.variantes || []).reduce((acc: number, v: any) => acc + (v.stockActual || 0), 0),
    concentracion: dto.concentracion || undefined,
    notasSalida: dto.notasSalida || undefined,
    notasCorazon: dto.notasCorazon || undefined,
    notasFondo: dto.notasFondo || undefined,
    estaciones: dto.estaciones || undefined,
    longevidad: dto.longevidad || undefined,
    guiaUso: dto.guiaUso || undefined,
    intensidad: dto.intensidad || undefined,
    rating: dto.promedioCalificacion || 0,
    reviewCount: dto.totalResenas || 0,
  };
};

// ─── Products ────────────────────────────────────────────────
export const productsAPI = {
  async getAll(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const dtos = await apiClient<any[]>(`/productos${query}`);
    return dtos.map(mapProductoDTOToProduct);
  },
  async getById(id: string) {
    const dto = await apiClient<any>(`/productos/${id}`);
    return mapProductoDTOToProduct(dto);
  },
  async create(data: any) {
    return apiClient<any>('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: any) {
    return apiClient<any>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string) {
    return apiClient<any>(`/productos/${id}`, {
      method: 'DELETE',
    });
  },
  /**
   * Sube hasta 3 imágenes de un producto a Cloudinary.
   * Se llama después de crear/actualizar el producto.
   */
  async uploadImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('imagenes', file));
    return apiClient<any>(`/productos/${id}/imagenes`, {
      method: 'POST',
      body: formData,
    });
  },
  async getDestacados() {
    const dtos = await apiClient<any[]>('/productos/destacados');
    return dtos.map(mapProductoDTOToProduct);
  }
};

// ─── Search (Autocompletado) ──────────────────────────────────
export const searchAPI = {
  async buscarSugerencias(q: string): Promise<Product[]> {
    if (q.trim().length < 2) return [];
    const dtos = await apiClient<any[]>(`/productos/buscar?q=${encodeURIComponent(q.trim())}`);
    return dtos.map(mapProductoDTOToProduct);
  },
};
