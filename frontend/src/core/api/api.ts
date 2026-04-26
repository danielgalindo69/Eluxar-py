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
  // Backend wraps responses in ApiResponse { status, message, data }
  return result.data as T;
}

// ─── Mappers ─────────────────────────────────────────────────
const mapProductoDTOToProduct = (dto: any): Product => ({
  id: String(dto.id),
  name: dto.nombre || '',
  type: dto.categoria || '',
  price: `${dto.variantes?.[0]?.precioVenta || 0}€`,
  image: dto.imagenes?.[0] || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080',
  hoverImage: dto.imagenes?.[1],
  description: dto.descripcion || '',
  brand: dto.marca || 'Eluxar',
  gender: 'Unisex', // Default as backend doesn't seem to have it in DTO
  olfactoryFamily: dto.familiaOlfativa || '',
  category: dto.categoria || '',
  variants: (dto.variantes || []).map((v: any) => ({
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
        email: data.email,
        role: data.rol,
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
        email: data.email,
        role: data.rol,
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
  productId: string;
  name: string;
  image: string;
  volume: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado';
  items: OrderItem[];
  total: number;
  address: string;
  paymentMethod: string;
  trackingNumber?: string;
}

export const MOCK_ORDERS: Order[] = [];

export const ordersAPI = {
  async getAll() { await delay(); return [...MOCK_ORDERS]; },
  async getById(id: string) { await delay(300); return MOCK_ORDERS.find(o => o.id === id) || null; },
  async updateAddress(orderId: string, address: string) { await delay(); return { success: true, orderId, address }; },
};

// ─── Inventory ───────────────────────────────────────────────
export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Salida';
  quantity: number;
  date: string;
  user: string;
  notes: string;
}

export const MOCK_INVENTORY: InventoryMovement[] = [];

export const inventoryAPI = {
  async getMovements() { await delay(); return [...MOCK_INVENTORY]; },
  async addMovement(m: Omit<InventoryMovement, 'id'>) {
    await delay();
    return { ...m, id: crypto.randomUUID() };
  },
};

// ─── Stock Alerts ────────────────────────────────────────────
export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  severity: 'warning' | 'critical';
}

export const stockAlertsAPI = {
  async getAlerts(): Promise<StockAlert[]> {
    await delay();
    return [
      { productId: '3', productName: 'Iris Concrete', currentStock: 4, threshold: 10, severity: 'critical' },
      { productId: '5', productName: 'Vetiver Absolute', currentStock: 8, threshold: 10, severity: 'warning' },
      { productId: '7', productName: 'Rose Noir', currentStock: 3, threshold: 15, severity: 'critical' },
      { productId: '9', productName: 'Ambre Sauvage', currentStock: 12, threshold: 15, severity: 'warning' },
    ];
  },
  async updateThreshold(productId: string, threshold: number) {
    await delay();
    return { success: true, productId, threshold };
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
    await delay(300);
    return [
      { id: 1, question: '¿Qué estación del año te inspira más?', options: ['Primavera', 'Verano', 'Otoño', 'Invierno'] },
      { id: 2, question: '¿Cuál es tu ambiente ideal?', options: ['Jardín florido', 'Bosque de montaña', 'Playa al atardecer', 'Biblioteca antigua'] },
      { id: 3, question: '¿Qué intensidad prefieres?', options: ['Sutil e íntima', 'Moderada y versátil', 'Intensa y envolvente', 'Poderosa y duradera'] },
      { id: 4, question: '¿Para qué ocasión buscas fragancia?', options: ['Día a día', 'Oficina elegante', 'Cena romántica', 'Evento especial'] },
      { id: 5, question: '¿Qué ingrediente te atrae más?', options: ['Cítricos frescos', 'Flores delicadas', 'Maderas profundas', 'Especias orientales'] },
    ];
  },
  async submitFragranceTest(_answers: Record<number, string>) {
    await delay(1500);
    return { recommendedProductIds: ['1', '4', '2'] };
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
    await delay(1200);
    const responses: Record<string, string> = {
      default: '¡Gracias por tu pregunta! Como asesor de fragancias de Eluxar, te recomiendo explorar nuestra colección de Extrait de Parfum para una experiencia olfativa premium. ¿Te gustaría que te recomiende algo específico?',
    };
    if (message.toLowerCase().includes('hombre')) return { reply: 'Para caballeros, nuestro Oud Marine es una opción excepcional. Combina la profundidad del Oud con notas marinas frescas. ¿Te gustaría conocer más detalles?' };
    if (message.toLowerCase().includes('mujer')) return { reply: 'Te recomiendo Iris Concrete, una composición minimalista y elegante con iris absoluto y madera de cedro. Es perfecta para quienes buscan sofisticación sutil.' };
    if (message.toLowerCase().includes('regalo')) return { reply: 'Para regalo, nuestro Black Amber es una elección segura. Viene en un estuche premium y su aroma es universalmente apreciado. ¿Deseas que lo añada a tu bolsa?' };
    if (message.toLowerCase().includes('durar') || message.toLowerCase().includes('larga duración')) return { reply: 'Si buscas máxima duración, los Extrait de Parfum son ideales. Con concentraciones del 25-30%, nuestras fragancias pueden durar más de 12 horas. Oud Marine y Black Amber son los más longevos.' };
    return { reply: responses.default };
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
