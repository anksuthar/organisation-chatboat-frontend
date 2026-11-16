export interface ProductImage {
  id: number;
  image_path: string;
  display_order: number;
}

export interface ProductItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category_id: number | null;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductDetail extends ProductItem {
  images: ProductImage[];
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: string;
  sku: string;
  stock_quantity: number;
  category_id?: number;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: string;
  stock_quantity?: number;
  category_id?: number;
  is_active?: boolean;
}
