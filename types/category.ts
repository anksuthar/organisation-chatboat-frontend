export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
}
