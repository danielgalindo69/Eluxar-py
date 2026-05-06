import { Product } from '../../features/products/types/products';

const API_BASE = '/api';

// Simulate network delay (kept for compatibility with remaining mock services)
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ─── API Client ──────────────────────────────────────────────
async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('eluxar_token');
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  const result = await response.json();
  // Backend might wrap responses in ApiResponse { status, message, data }
  // or return the data directly
  return result.data !== undefined ? result.data : result;
}

// ─── Mappers ─────────────────────────────────────────────────
const mapProductoDTOToProduct = (dto: any): Product => ({
  id: String(dto.id),
  name: dto.nombre || '',
  type: dto.categoria || '',
  price: `${dto.variantes?.[0]?.precioVenta || 0} COP`,
  image: dto.imagenes?.[0] || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080',
  hoverImage: dto.imagenes?.[1],
  description: dto.descripcion || '',
  brand: dto.marca || 'Eluxar',
  gender: 'Unisex', // Default as backend doesn't seem to have it in DTO
  olfactoryFamily: dto.familiaOlfativa || '',
  category: dto.categoria || '',
  variants: (dto.variantes || []).map((v: any) => ({
    id: v.id,
    volume: `${v.tamanoMl}ml`,
    price: v.precioVenta,
    stock: v.stockActual
  })),
  stock: (dto.variantes || []).reduce((acc: number, v: any) => acc + (v.stockActual || 0), 0),
  notes: {
    top: 'Notas de salida', // Placeholders as backend doesn't have detailed notes
    heart: 'Notas de corazón',
    base: 'Notas de fondo'
  },
  specs: {
    volume: dto.variantes?.[0] ? `${dto.variantes[0].tamanoMl}ml` : 'N/A',
    longevity: '8-10 horas',
    sillage: 'Moderado'
  }
});

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  async login(email: string, password: string) {
    const data = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user info
    if (data.token) {
      localStorage.setItem('eluxar_token', data.token);
      const user = {
        id: String(data.userId),
        name: data.nombre,
        lastName: data.apellido,
        email: data.email,
        role: data.rol,
        phone: data.telefono,
        token: data.token,
        pictureUrl: data.pictureUrl ?? null,
      };
      localStorage.setItem('eluxar_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Login failed: No token received');
  },
  async register(data: { firstName: string; lastName: string; email: string; password: string }) {
    return apiClient<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.firstName,
        apellido: data.lastName,
        email: data.email,
        password: data.password
      }),
    });
  },
  async registerAdmin(data: { firstName: string; lastName: string; email: string; password: string }) {
    return apiClient<any>('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.firstName,
        apellido: data.lastName,
        email: data.email,
        password: data.password
      }),
    });
  },
  async logout() {
    localStorage.removeItem('eluxar_token');
    localStorage.removeItem('eluxar_user');
    return { success: true };
  },
  async googleLogin(credential: string) {
    const data = await apiClient<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: credential }),
    });

    if (data.token) {
      localStorage.setItem('eluxar_token', data.token);
      const user = {
        id: String(data.userId),
        name: data.nombre,
        lastName: data.apellido,
        email: data.email,
        role: data.rol,
        phone: data.telefono,
        token: data.token,
        pictureUrl: data.pictureUrl ?? null,
      };
      localStorage.setItem('eluxar_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Google login failed: No token received');
  },
  async forgotPassword(email: string) {
    return apiClient<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async verifyResetCode(email: string, code: string) {
    return apiClient<any>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },
  async resetPassword(email: string, code: string, newPassword: string) {
    return apiClient<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return apiClient<any>('/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async changePassword(oldPassword: string, newPassword: string) {
    return apiClient<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

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
};

// ─── Addresses ───────────────────────────────────────────────
export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [];

export const addressAPI = {
  async getAll() { await delay(300); return [...mockAddresses]; },
  async create(address: Omit<Address, 'id'>) {
    await delay();
    const newAddr = { ...address, id: crypto.randomUUID() };
    mockAddresses.push(newAddr);
    return newAddr;
  },
  async update(id: string, data: Partial<Address>) {
    await delay();
    const idx = mockAddresses.findIndex(a => a.id === id);
    if (idx !== -1) Object.assign(mockAddresses[idx], data);
    return mockAddresses[idx];
  },
  async remove(id: string) { await delay(); return { success: true, id }; },
  async setDefault(id: string) {
    await delay();
    mockAddresses.forEach(a => a.isDefault = a.id === id);
    return { success: true };
  },
};

// ─── Orders ──────────────────────────────────────────────────
export interface OrderItem {
  id?: number;
  varianteId?: number;
  productoNombre?: string;
  tamanoMl?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  imagenUrl?: string;
  // Campos antiguos para retrocompatibilidad
  productId?: string;
  name?: string;
  image?: string;
  volume?: string;
  price?: number;
}

export interface Order {
  id: string | number;
  date?: string;
  creadoEn?: string;
  status?: string;
  estado?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  address?: string;
  direccionEnvio?: string;
  paymentMethod?: string;
  metodoPago?: string;
  trackingNumber?: string;
}

export const MOCK_ORDERS: Order[] = []; // Se mantiene para compatibilidad temporal si es necesario

export const ordersAPI = {
  async getAll() {
    return apiClient<any[]>('/pedidos/mis-pedidos');
  },
  async getAllAdmin() {
    return apiClient<any[]>('/pedidos/todos');
  },
  async getById(id: string) {
    return apiClient<any>(`/pedidos/${id}`);
  },
  async updateStatus(id: string, status: string) {
    return apiClient<any>(`/pedidos/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: status }),
    });
  },
  async updateAddress(orderId: string, address: string) { 
    await delay(); return { success: true, orderId, address }; 
  },
  async create(data: { direccion: string; ciudad: string; codigoPostal?: string; provincia?: string; pais: string; metodoPago: string; notas?: string }) {
    return apiClient<any>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// ─── Admin Users ──────────────────────────────────────────────
export const adminUsersAPI = {
  async getAll() {
    return apiClient<any[]>('/usuarios');
  },
  async updateRole(id: string, role: string) {
    return apiClient<any>(`/usuarios/${id}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol: role }),
    });
  },
  async toggleActive(id: string) {
    return apiClient<any>(`/usuarios/${id}/toggle-active`, {
      method: 'PUT',
    });
  }
};

// ─── Inventory ───────────────────────────────────────────────
export interface InventoryItem {
  id: number;
  varianteId: number;
  sku: string;
  productoNombre: string;
  tamanoMl: number;
  stockActual: number;
  stockReservado: number;
  stockMinimo: number;
  stockBajo: boolean;
}

export interface InventoryMovement {
  id: number;
  varianteId: number;
  productoNombre: string;
  tamanoMl: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'RESERVA' | 'LIBERACION';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

export interface StockAlert {
  varianteId: number;
  sku: string;
  productoNombre: string;
  tamanoMl: number;
  stockActual: number;
  stockMinimo: number;
}

export const inventoryAPI = {
  async getAll(): Promise<InventoryItem[]> {
    return apiClient<InventoryItem[]>('/inventario');
  },
  async getMovements(): Promise<InventoryMovement[]> {
    return apiClient<InventoryMovement[]>('/inventario/movimientos');
  },
  async getAlerts(): Promise<StockAlert[]> {
    return apiClient<StockAlert[]>('/inventario/alertas');
  },
  async update(varianteId: number | string, data: { stockActual: number; stockMinimo?: number; motivo?: string }) {
    return apiClient<InventoryItem>(`/inventario/${varianteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ─── Payments (Admin) ────────────────────────────────────────
export interface Payment {
  id: string;
  orderId: string;
  client: string;
  amount: number;
  method: string;
  status: 'Pendiente' | 'Confirmado' | 'Rechazado';
  date: string;
}

export const MOCK_PAYMENTS: Payment[] = [];

export const paymentsAPI = {
  async getAll() { await delay(); return [...MOCK_PAYMENTS]; },
  async updateStatus(id: string, status: Payment['status']) { await delay(); return { success: true, id, status }; },
};

// ─── Shipping (Admin) ────────────────────────────────────────
export interface Shipment {
  id: string;
  orderId: string;
  client: string;
  address: string;
  carrier: string;
  trackingNumber: string;
  status: 'Preparando' | 'En tránsito' | 'Entregado' | 'Devuelto';
  date: string;
  estimatedDelivery: string;
}

export const MOCK_SHIPMENTS: Shipment[] = [];

export const shippingAPI = {
  async getAll() { await delay(); return [...MOCK_SHIPMENTS]; },
  async updateStatus(id: string, status: Shipment['status']) { await delay(); return { success: true, id, status }; },
};

// ─── Banners (Admin) ─────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
}

export const MOCK_BANNERS: Banner[] = [];

export const bannersAPI = {
  async getAll() { await delay(); return [...MOCK_BANNERS]; },
  async create(b: Omit<Banner, 'id'>) { await delay(); return { ...b, id: crypto.randomUUID() }; },
  async update(id: string, data: Partial<Banner>) { await delay(); return { success: true, id, ...data }; },
  async remove(id: string) { await delay(); return { success: true, id }; },
  async reorder(ids: string[]) { await delay(); return { success: true, ids }; },
};

// ─── Categories & Brands ─────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  type: 'category' | 'brand';
  productCount: number;
}

export const categoriesAPI = {
  async getAll() {
    const list = await apiClient<any[]>('/categorias');
    return list.map(c => ({
      id: String(c.id),
      name: c.nombre,
      type: 'category',
      productCount: 0
    })) as Category[];
  },
  async create(data: { nombre: string; descripcion?: string }) {
    return apiClient<any>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const brandsAPI = {
  async getAll() {
    const list = await apiClient<any[]>('/marcas');
    return list.map(m => ({
      id: String(m.id),
      name: m.nombre,
      type: 'brand',
      productCount: 0
    })) as Category[];
  },
  async create(data: { nombre: string; descripcion?: string; logoUrl?: string }) {
    return apiClient<any>('/marcas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

// ─── AI (mock) ───────────────────────────────────────────────
export const aiAPI = {
  async getFragranceTestQuestions() {
    return apiClient<any[]>('/ia/test-preguntas');
  },
  async submitFragranceTest(answers: Record<number, string>) {
    return apiClient<any>('/ia/test-analizar', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
  async getRecommendations() {
    await delay(800);
    return { recommendedProductIds: ['4', '1', '3', '2'], reasons: {
      '4': 'Tu perfil indica preferencia por notas cálidas y envolventes.',
      '1': 'Ideal para tu estilo versátil según tus compras anteriores.',
      '3': 'Coincide con tu preferencia por fragancias íntimas y elegantes.',
      '2': 'Recomendado por usuarios con gustos similares al tuyo.',
    }};
  },
  async chatMessage(message: string) {
    try {
      const result = await apiClient<any>('/ia/recomendar', {
        method: 'POST',
        body: JSON.stringify({ mensaje: message }),
      });
      
      // Manejar respuesta si viene envuelta o directa
      const responseData = result.mensaje ? result : (result.data || result);

      let reply = "";
      if (responseData.mensaje) {
          reply += `${responseData.mensaje}\n\n`;
      }
      
      if (responseData.recomendaciones && responseData.recomendaciones.length > 0) {
          responseData.recomendaciones.forEach((r: any) => {
              reply += `- ${r.nombre}: ${r.motivo}\n`;
          });
      }

      if (!reply) {
        reply = "Lo siento, no pude procesar tu solicitud en este momento.";
      }

      return { reply };
    } catch (error) {
      console.error('Error in chatMessage:', error);
      throw error;
    }
  },
  async improveImage(file: File, style?: string, prompt?: string) {
    const formData = new FormData();
    formData.append('imagen', file);
    if (style) formData.append('estilo', style);
    if (prompt) formData.append('prompt', prompt);

    return apiClient<any>('/ia/imagen/mejorar', {
      method: 'POST',
      body: formData,
    });
  },
};

// ─── User Profile ─────────────────────────────────────────────
export const userAPI = {
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ imageUrl: string }>('/usuarios/profile/image', {
      method: 'POST',
      body: formData,
    });
  },
};

// ─── Cart ────────────────────────────────────────────────────
export const cartAPI = {
  async getActive() {
    return apiClient<any>('/carrito');
  },
  async addItem(varianteId: number, cantidad: number) {
    return apiClient<any>('/carrito/agregar', {
      method: 'POST',
      body: JSON.stringify({ varianteId, cantidad }),
    });
  },
  async updateItem(itemId: number, cantidad: number) {
    return apiClient<any>(`/carrito/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    });
  },
  async removeItem(itemId: number) {
    return apiClient<any>(`/carrito/item/${itemId}`, {
      method: 'DELETE',
    });
  }
};

// ─── Prices ──────────────────────────────────────────────────
export const pricesAPI = {
  async bulkUpdate(updates: Array<{ varianteId: number; nuevoPrecioVenta: number; nuevoPrecioOferta?: number; nuevoPrecioCosto?: number }>) {
    return apiClient<any>('/admin/precios/masivo', {
      method: 'PUT',
      body: JSON.stringify({ actualizaciones: updates }),
    });
  }
};
