import { apiFetch } from "@/services/api-client";
import type { Cart, CartItemCreateInput, CartItemUpdateInput } from "@/types/cart";

export function getCart(): Promise<Cart> {
  return apiFetch("cart");
}

export function addCartItem(input: CartItemCreateInput): Promise<Cart> {
  return apiFetch("cart/items", { method: "POST", body: JSON.stringify(input) });
}

export function updateCartItem(itemId: number, input: CartItemUpdateInput): Promise<Cart> {
  return apiFetch(`cart/items/${itemId}`, { method: "PUT", body: JSON.stringify(input) });
}

export function removeCartItem(itemId: number): Promise<void> {
  return apiFetch(`cart/items/${itemId}`, { method: "DELETE" });
}

export function clearCart(): Promise<void> {
  return apiFetch("cart", { method: "DELETE" });
}
