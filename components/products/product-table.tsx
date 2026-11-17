"use client";

import { Eye, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QueryError } from "@/components/shared/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductCategories } from "@/hooks/use-product-categories";
import { useDeleteProduct, useProducts } from "@/hooks/use-products";
import type { ProductItem } from "@/types/product";

export function ProductTable() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { data: categories } = useProductCategories();
  const { data: products, isLoading, isError, error, refetch } = useProducts({
    categoryId: categoryFilter === "all" ? undefined : Number(categoryFilter),
  });
  const deleteProduct = useDeleteProduct();
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  const categoryName = (categoryId: number | null) =>
    categoryId ? categories?.find((c) => c.id === categoryId)?.name ?? `#${categoryId}` : "Uncategorized";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
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
          <Button render={<Link href="/admin/products/new" />}>
            <Plus />
            Add product
          </Button>
        </div>
      </div>

      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} title="Couldn't load products" />
      ) : (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No products yet.
                </TableCell>
              </TableRow>
            )}

            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-muted-foreground">{categoryName(product.category_id)}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell className="text-muted-foreground">{product.stock_quantity}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={product.is_active ? "" : "text-muted-foreground"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${product.name}`}
                    render={<Link href={`/admin/products/${product.id}`} />}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${product.name}`}
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      <AlertDialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingProduct?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product and its images. Past orders referencing it are unaffected. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingProduct) deleteProduct.mutate(deletingProduct.id);
                setDeletingProduct(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
