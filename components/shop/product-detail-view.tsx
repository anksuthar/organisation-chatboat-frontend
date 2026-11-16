"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddCartItem } from "@/hooks/use-cart";
import { useProduct } from "@/hooks/use-products";
import { productImageUrl } from "@/services/products";

export function ProductDetailView({ productId }: { productId: number }) {
  const { data: product, isLoading } = useProduct(productId);
  const addToCart = useAddCartItem();
  const [quantity, setQuantity] = useState(1);

  if (isLoading || !product) {
    return <Skeleton className="h-96 w-full" />;
  }

  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        {product.images.length === 0 ? (
          <div className="aspect-square rounded-lg bg-muted" />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {product.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element -- served through the BFF proxy
              <img
                key={image.id}
                src={productImageUrl(product.id, image.id)}
                alt={product.name}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-lg text-muted-foreground">${product.price}</p>
        </div>

        {product.description && <p className="text-sm leading-relaxed">{product.description}</p>}

        {outOfStock ? (
          <Badge variant="secondary" className="text-muted-foreground">
            Out of stock
          </Badge>
        ) : (
          <p className="text-sm text-muted-foreground">{product.stock_quantity} in stock</p>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={product.stock_quantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20"
            disabled={outOfStock}
          />
          <Button
            disabled={outOfStock || addToCart.isPending}
            onClick={() => addToCart.mutate({ product_id: product.id, quantity })}
          >
            <ShoppingCart />
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
