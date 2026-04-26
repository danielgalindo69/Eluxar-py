export interface ProductVariant {
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
  gender: 'Unisex' | 'Masculino' | 'Femenino';
  olfactoryFamily: string;
  category: string;
  variants: ProductVariant[];
  stock: number;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
  specs: {
    volume: string;
    longevity: string;
    sillage: string;
  };
}

export const PRODUCTS: Product[] = [];
