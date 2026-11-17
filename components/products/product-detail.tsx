"use client";

import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductEditDialog } from "@/components/products/product-edit-dialog";
import { useProductCategories } from "@/hooks/use-product-categories";
import { useAddProductImages, useDeleteProduct, useProduct, useRemoveProductImage } from "@/hooks/use-products";
import { productImageUrl } from "@/services/products";

export function ProductDetail({ productId }: { productId: number }) {
  const router = useRouter();
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const { data: categories } = useProductCategories();
  const addImages = useAddProductImages();
  const removeImage = useRemoveProductImage();
  const deleteProduct = useDeleteProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} notFoundLabel="Product" className="max-w-xl" />;
  }

  if (isLoading || !product) {
    return <Skeleton className="h-64 w-full" />;
  }

  const categoryName = product.category_id
    ? categories?.find((c) => c.id === product.category_id)?.name ?? `#${product.category_id}`
    : "Uncategorized";

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      addImages.mutate({ id: productId, images: files });
    }
    event.target.value = "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">SKU {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="text-destructive" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">${product.price}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">{product.stock_quantity}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">{categoryName}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{product.is_active ? "Active" : "Inactive"}</Badge>
          </CardContent>
        </Card>
      </div>

      {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Photos</h2>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={addImages.isPending}>
            <ImagePlus />
            Add photos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>

        {product.images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {product.images.map((image) => (
              <div key={image.id} className="group relative size-28 overflow-hidden rounded-md border">
                {/* eslint-disable-next-line @next/next/no-img-element -- served through the BFF proxy, not worth routing through next/image's optimizer for admin-only thumbnails */}
                <img src={productImageUrl(product.id, image.id)} alt={product.name} className="size-full object-cover" />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  className="absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                  onClick={() => removeImage.mutate({ productId: product.id, imageId: image.id })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductEditDialog product={product} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{product.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product and its photos. Past orders referencing it are unaffected. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteProduct.mutateAsync(product.id);
                  router.push("/admin/products");
                } catch {
                  // Error toast is shown by the mutation hook.
                }
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
