import { apiFetch } from "@/services/api-client";
import type { OrderDetail, OrderSummary } from "@/types/order";

export function listOrders(): Promise<OrderSummary[]> {
  return apiFetch("orders");
}

export function getOrder(id: number): Promise<OrderDetail> {
  return apiFetch(`orders/${id}`);
}

export function checkout(): Promise<OrderSummary> {
  return apiFetch("orders", { method: "POST" });
}
