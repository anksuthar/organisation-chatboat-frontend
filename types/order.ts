export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface OrderSummary {
  id: number;
  status: OrderStatus;
  total_amount: string;
  created_at: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
}
