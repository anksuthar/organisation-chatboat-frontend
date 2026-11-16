"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";

export function CartView() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const checkout = useCheckout();

  async function handleCheckout() {
    const order = await checkout.mutateAsync();
    router.push(`/orders/${order.id}`);
  }

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const items = cart?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead>Line total</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_name ?? <span className="text-muted-foreground italic">No longer available</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit_price ? `$${item.unit_price}` : "—"}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        defaultValue={item.quantity}
                        disabled={!item.product_id}
                        onBlur={(e) => {
                          const quantity = Math.max(1, Number(e.target.value));
                          if (quantity !== item.quantity) {
                            updateItem.mutate({ itemId: item.id, input: { quantity } });
                          }
                        }}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{item.line_total ? `$${item.line_total}` : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove from cart"
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Total: ${cart?.total_amount}</p>
            <Button size="lg" disabled={checkout.isPending} onClick={handleCheckout}>
              {checkout.isPending ? "Placing order…" : "Checkout"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
