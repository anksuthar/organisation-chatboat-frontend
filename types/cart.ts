export interface CartItem {
  id: number;
  product_id: number | null;
  product_name: string | null;
  unit_price: string | null;
  quantity: number;
  line_total: string | null;
}

export interface Cart {
  items: CartItem[];
  total_amount: string;
}

export interface CartItemCreateInput {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdateInput {
  quantity: number;
}
