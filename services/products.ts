import { apiFetch, apiUpload } from "@/services/api-client";
import type { ProductCreateInput, ProductDetail, ProductImage, ProductItem, ProductUpdateInput } from "@/types/product";

export function listProducts(params?: { categoryId?: number; q?: string }): Promise<ProductItem[]> {
  const search = new URLSearchParams();
  if (params?.categoryId) search.set("category_id", String(params.categoryId));
  if (params?.q) search.set("q", params.q);
  const query = search.toString();
  return apiFetch(`products${query ? `?${query}` : ""}`);
}

export function getProduct(id: number): Promise<ProductDetail> {
  return apiFetch(`products/${id}`);
}

/** URL for an `<img>` tag — goes through the same-origin BFF proxy, which
 * attaches the session cookie as a Bearer token server-side. */
export function productImageUrl(productId: number, imageId: number): string {
  return `/api/backend/products/${productId}/images/${imageId}/file`;
}

export async function uploadProduct({
  input,
  images,
  onProgress,
}: {
  input: ProductCreateInput;
  images: File[];
  onProgress?: (percent: number) => void;
}): Promise<ProductItem> {
  const formData = new FormData();
  formData.append("name", input.name);
  if (input.description) formData.append("description", input.description);
  formData.append("price", input.price);
  formData.append("sku", input.sku);
  formData.append("stock_quantity", String(input.stock_quantity));
  if (input.category_id) formData.append("category_id", String(input.category_id));
  images.forEach((file) => formData.append("images", file));

  return apiUpload<ProductItem>("products/upload", formData, { onProgress });
}

export function updateProduct(id: number, input: ProductUpdateInput): Promise<ProductItem> {
  return apiFetch(`products/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function addProductImages(id: number, images: File[]): Promise<ProductImage[]> {
  const formData = new FormData();
  images.forEach((file) => formData.append("images", file));
  return apiFetch(`products/${id}/images`, { method: "POST", body: formData });
}

export function removeProductImage(productId: number, imageId: number): Promise<void> {
  return apiFetch(`products/${productId}/images/${imageId}`, { method: "DELETE" });
}

export function deleteProduct(id: number): Promise<void> {
  return apiFetch(`products/${id}`, { method: "DELETE" });
}
