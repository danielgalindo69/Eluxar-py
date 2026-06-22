import { apiClient, formatPrice, API_URL } from './client';
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

export const mapProductoDTOToProduct = (dto: any): Product => ({
  id: String(dto.id),
  name: dto.nombre || '',
  type: dto.familiaOlfativa || dto.categoria || '',  // muestra familia olfativa como tipo
  price: `${formatPrice(dto.variantes?.[0]?.precioVenta || 0)} COP`,
  image: (dto.imagenes && dto.imagenes[0]?.url) || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080',
  hoverImage: dto.imagenes && dto.imagenes[1]?.url,
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
  rating: dto.promedioCalificacion || 0,
  reviewCount: dto.totalResenas || 0,
  notes: {
    top: 'Notas de salida',
    heart: 'Notas de corazón',
    base: 'Notas de fondo'
  },
  specs: {
    volume: dto.variantes?.[0] ? `${dto.variantes[0].tamanoMl}ml` : 'N/A',
    longevity: '8-10 horas',
    sillage: 'Moderado'
  }
});

// ─── Products ────────────────────────────────────────────────
export const productsAPI = {
  async getAll(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const dtos = await apiClient<any[]>(`/productos${query}`);
    if (!dtos || dtos.length === 0) {
      return [
        { id: '1', name: 'Acqua Di Gio', type: 'EDT', price: '95COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Fragancia fresca, marina y cítrica. Ideal para el día a día y la oficina.', brand: 'Armani', gender: 'Masculino', olfactoryFamily: 'Acuática', category: 'Perfume', variants: [], stock: 10, notes: { top: 'Marina', heart: 'Cítrico', base: 'Madera' }, specs: { volume: '100ml', longevity: 'Media', sillage: 'Moderado' } },
        { id: '2', name: 'La Vie Est Belle', type: 'EDP', price: '120COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Perfume muy dulce, con notas de praliné, vainilla y flores. Perfecto para salidas de noche.', brand: 'Lancome', gender: 'Femenino', olfactoryFamily: 'Dulce', category: 'Perfume', variants: [], stock: 5, notes: { top: 'Praliné', heart: 'Vainilla', base: 'Flores' }, specs: { volume: '100ml', longevity: 'Alta', sillage: 'Fuerte' } },
        { id: '3', name: 'Sauvage Dior', type: 'EDP', price: '110COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Aroma amaderado y especiado. Muy versátil y masculino, proyecta mucha seguridad.', brand: 'Dior', gender: 'Masculino', olfactoryFamily: 'Amaderada', category: 'Perfume', variants: [], stock: 8, notes: { top: 'Pimienta', heart: 'Bergamota', base: 'Madera' }, specs: { volume: '100ml', longevity: 'Alta', sillage: 'Fuerte' } },
        { id: '4', name: 'CK One', type: 'EDT', price: '50COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Aroma cítrico, ligero y unisex. Excelente para clima caluroso o gimnasio.', brand: 'Calvin Klein', gender: 'Unisex', olfactoryFamily: 'Cítrica', category: 'Perfume', variants: [], stock: 15, notes: { top: 'Limón', heart: 'Té verde', base: 'Almizcle' }, specs: { volume: '200ml', longevity: 'Media', sillage: 'Ligero' } },
        { id: '5', name: 'Bleu de Chanel', type: 'EDP', price: '135COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Fragancia elegante, amaderada y cítrica. Perfecta para el hombre moderno, uso en oficina o eventos formales.', brand: 'Chanel', gender: 'Masculino', olfactoryFamily: 'Amaderada', category: 'Perfume', variants: [], stock: 12, notes: { top: 'Cítricos', heart: 'Gengibre', base: 'Cedro' }, specs: { volume: '100ml', longevity: 'Alta', sillage: 'Fuerte' } },
        { id: '6', name: 'Baccarat Rouge 540', type: 'EDP', price: '250COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Aroma lujoso de ámbar y madera. Unisex, dulce y extremadamente duradero. Llama la atención en eventos especiales.', brand: 'Maison Francis Kurkdjian', gender: 'Unisex', olfactoryFamily: 'Ámbar', category: 'Perfume', variants: [], stock: 3, notes: { top: 'Azafrán', heart: 'Jazmín', base: 'Ámbar Gris' }, specs: { volume: '70ml', longevity: 'Muy Alta', sillage: 'Intenso' } },
        { id: '7', name: 'Black Orchid', type: 'EDP', price: '160COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Misteriosa, oscura y floral especiada. Unisex, ideal para personalidades atrevidas y noches frías.', brand: 'Tom Ford', gender: 'Unisex', olfactoryFamily: 'Oriental', category: 'Perfume', variants: [], stock: 7, notes: { top: 'Trufa', heart: 'Orquídea', base: 'Chocolate Oscuro' }, specs: { volume: '100ml', longevity: 'Muy Alta', sillage: 'Fuerte' } },
        { id: '8', name: 'Coco Mademoiselle', type: 'EDP', price: '145COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Floral y oriental. Elegante, femenina y sofisticada. Versátil para el trabajo y citas románticas.', brand: 'Chanel', gender: 'Femenino', olfactoryFamily: 'Floral', category: 'Perfume', variants: [], stock: 9, notes: { top: 'Naranja', heart: 'Rosa', base: 'Pachulí' }, specs: { volume: '100ml', longevity: 'Alta', sillage: 'Moderado' } },
        { id: '9', name: 'YSL Y', type: 'EDP', price: '125COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Fresco, afrutado y con un toque de madera. Juvenil y energético, excelente para salidas nocturnas y uso casual.', brand: 'Yves Saint Laurent', gender: 'Masculino', olfactoryFamily: 'Aromática', category: 'Perfume', variants: [], stock: 11, notes: { top: 'Manzana', heart: 'Salvia', base: 'Haba Tonka' }, specs: { volume: '100ml', longevity: 'Alta', sillage: 'Fuerte' } },
        { id: '10', name: 'Good Girl', type: 'EDP', price: '115COP', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800', description: 'Aroma seductor y dulce con notas de haba tonka y cacao. Perfecto para mujeres empoderadas en eventos nocturnos.', brand: 'Carolina Herrera', gender: 'Femenino', olfactoryFamily: 'Oriental', category: 'Perfume', variants: [], stock: 14, notes: { top: 'Almendra', heart: 'Jazmín', base: 'Cacao' }, specs: { volume: '80ml', longevity: 'Alta', sillage: 'Fuerte' } }
      ] as Product[];
    }
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
