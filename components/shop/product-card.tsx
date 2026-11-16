"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAddCartItem } from "@/hooks/use-cart";
import type { ProductItem } from "@/types/product";

export function ProductCard({ product }: { product: ProductItem }) {
  const addToCart = useAddCartItem();
  const outOfStock = product.stock_quantity <= 0;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={`/shop/${product.id}`} className="block aspect-square bg-muted" />
      <CardContent className="flex-1 space-y-1 pt-4">
        <Link href={`/shop/${product.id}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <p className="text-sm text-muted-foreground">${product.price}</p>
        {outOfStock && (
          <Badge variant="secondary" className="text-muted-foreground">
            Out of stock
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          className="w-full"
          disabled={outOfStock || addToCart.isPending}
          onClick={() => addToCart.mutate({ product_id: product.id, quantity: 1 })}
        >
          <ShoppingCart />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
