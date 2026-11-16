import { apiFetch } from "@/services/api-client";
import type { ProductCategory, ProductCategoryCreateInput, ProductCategoryUpdateInput } from "@/types/product-category";

export function listProductCategories(): Promise<ProductCategory[]> {
  return apiFetch("product-categories");
}

export function createProductCategory(input: ProductCategoryCreateInput): Promise<ProductCategory> {
  return apiFetch("product-categories", { method: "POST", body: JSON.stringify(input) });
}

export function updateProductCategory(id: number, input: ProductCategoryUpdateInput): Promise<ProductCategory> {
  return apiFetch(`product-categories/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteProductCategory(id: number): Promise<void> {
  return apiFetch(`product-categories/${id}`, { method: "DELETE" });
}
