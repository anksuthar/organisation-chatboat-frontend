"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { checkout, getOrder, listOrders } from "@/services/orders";

const ORDERS_KEY = ["orders"] as const;
const CART_KEY = ["cart"] as const;

export function useOrders() {
  return useQuery({ queryKey: ORDERS_KEY, queryFn: listOrders });
}

export function useOrder(id: number) {
  return useQuery({ queryKey: [...ORDERS_KEY, id], queryFn: () => getOrder(id) });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Order placed");
    },
    onError: (error) => toast.error(error.message),
  });
}
