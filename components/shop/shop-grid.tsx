"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/product-card";
import { useProductCategories } from "@/hooks/use-product-categories";
import { useProducts } from "@/hooks/use-products";

export function ShopGrid() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const { data: categories } = useProductCategories();
  const { data: products, isLoading } = useProducts({
    categoryId: categoryFilter === "all" ? undefined : Number(categoryFilter),
    q: search || undefined,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function handleQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search products…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-56"
          />
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {!isLoading && products?.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No products found.</p>
      )}

      {!isLoading && products && products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
