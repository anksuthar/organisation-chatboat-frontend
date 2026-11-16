import { apiFetch } from "@/services/api-client";
import type { Category, CategoryCreateInput, CategoryUpdateInput } from "@/types/category";

export function listCategories(): Promise<Category[]> {
  return apiFetch("categories");
}

export function createCategory(input: CategoryCreateInput): Promise<Category> {
  return apiFetch("categories", { method: "POST", body: JSON.stringify(input) });
}

export function updateCategory(id: number, input: CategoryUpdateInput): Promise<Category> {
  return apiFetch(`categories/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteCategory(id: number): Promise<void> {
  return apiFetch(`categories/${id}`, { method: "DELETE" });
}
