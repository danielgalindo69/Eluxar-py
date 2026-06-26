export interface ProductVariant {
  id?: number;
  volume: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  hoverImage?: string;
  description: string;
  brand: string;
  gender: 'Unisex' | 'Masculino' | 'Femenino' | 'Niño' | 'Niña';
  olfactoryFamily: string;
  category: string;
  variants: ProductVariant[];
  stock: number;
  concentracion?: string;
  notasSalida?: string;
  notasCorazon?: string;
  notasFondo?: string;
  estaciones?: string;
  longevidad?: string;
  guiaUso?: string;
  intensidad?: string;
  rating?: number;
  reviewCount?: number;
}

export const PRODUCTS: Product[] = [];
