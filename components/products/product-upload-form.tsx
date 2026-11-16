"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductCategories } from "@/hooks/use-product-categories";
import { useUploadProduct } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional(),
  price: z.string().min(1, "Price is required"),
  sku: z.string().min(1, "SKU is required").max(64),
  stockQuantity: z.string().min(1, "Stock quantity is required"),
  categoryId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductUploadForm() {
  const router = useRouter();
  const { data: categories } = useProductCategories();
  const upload = useUploadProduct();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: "", sku: "", stockQuantity: "0", categoryId: "" },
  });

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
  });

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: ProductFormValues) {
    await upload.mutateAsync({
      input: {
        name: values.name,
        description: values.description,
        price: values.price,
        sku: values.sku,
        stock_quantity: Number(values.stockQuantity),
        category_id: values.categoryId ? Number(values.categoryId) : undefined,
      },
      images,
    });
    router.push("/admin/products");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Add product</h1>

      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-8 text-muted-foreground" />
        <p className="font-medium">Drag &amp; drop photos here, or click to browse</p>
        <p className="text-sm text-muted-foreground">JPG, PNG, or WebP — any number of images</p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, index) => (
            <div key={src} className="relative size-20 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element -- transient blob: preview URL, not worth routing through next/image's optimizer */}
              <img src={src} alt={images[index].name} className="size-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute top-1 right-1 size-5"
                onClick={() => removeImage(index)}
                aria-label={`Remove ${images[index].name}`}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      {images.length === 0 && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ImagePlus className="size-4" /> No photos added yet (optional)
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Wireless Mouse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="19.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. WM-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Optional description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {upload.isPending && <Progress value={upload.progress} />}

          <Button type="submit" disabled={upload.isPending} className="w-full">
            {upload.isPending ? `Uploading… ${upload.progress}%` : "Create product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
