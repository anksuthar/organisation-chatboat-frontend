export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProductCategoryCreateInput {
  name: string;
  description?: string;
}

export interface ProductCategoryUpdateInput {
  name?: string;
  description?: string;
}
