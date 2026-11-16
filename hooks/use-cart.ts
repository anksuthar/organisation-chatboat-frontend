"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "@/services/cart";
import type { CartItemCreateInput, CartItemUpdateInput } from "@/types/cart";

const CART_KEY = ["cart"] as const;

export function useCart() {
  return useQuery({ queryKey: CART_KEY, queryFn: getCart });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CartItemCreateInput) => addCartItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Added to cart");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: number; input: CartItemUpdateInput }) => updateCartItem(itemId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Removed from cart");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Cart cleared");
    },
    onError: (error) => toast.error(error.message),
  });
}
