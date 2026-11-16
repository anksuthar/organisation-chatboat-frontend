"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircleWarning } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useOrder } from "@/hooks/use-orders";

export function OrderDetail({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading || !order) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
          </p>
        </div>
        <Button
          variant="outline"
          render={
            <Link
              href={`/chat?prefill=${encodeURIComponent(
                `My order #${order.id} shows as ${order.status} but I never received it.`
              )}`}
            />
          }
        >
          <MessageCircleWarning />
          Report a problem
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusBadge status={order.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">${order.total_amount}</CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.unit_price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
