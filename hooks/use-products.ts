"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  addProductImages,
  deleteProduct,
  getProduct,
  listProducts,
  removeProductImage,
  updateProduct,
  uploadProduct,
} from "@/services/products";
import type { ProductCreateInput, ProductUpdateInput } from "@/types/product";

const PRODUCTS_KEY = ["products"] as const;

export function useProducts(params?: { categoryId?: number; q?: string }) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, params?.categoryId ?? "all", params?.q ?? ""],
    queryFn: () => listProducts(params),
  });
}

export function useProduct(id: number) {
  return useQuery({ queryKey: [...PRODUCTS_KEY, id], queryFn: () => getProduct(id) });
}

export function useUploadProduct() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (variables: { input: ProductCreateInput; images: File[] }) =>
      uploadProduct({ ...variables, onProgress: setProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product created");
      setProgress(0);
    },
    onError: (error) => {
      toast.error(error.message);
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductUpdateInput }) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useAddProductImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, images }: { id: number; images: File[] }) => addProductImages(id, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Images added");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRemoveProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      removeProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Image removed");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Product deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}
