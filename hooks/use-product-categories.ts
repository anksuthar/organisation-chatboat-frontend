"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProductCategory,
  deleteProductCategory,
  listProductCategories,
  updateProductCategory,
} from "@/services/product-categories";
import type { ProductCategoryCreateInput, ProductCategoryUpdateInput } from "@/types/product-category";

const PRODUCT_CATEGORIES_KEY = ["product-categories"] as const;

export function useProductCategories() {
  return useQuery({ queryKey: PRODUCT_CATEGORIES_KEY, queryFn: listProductCategories });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductCategoryCreateInput) => createProductCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORIES_KEY });
      toast.success("Category created");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductCategoryUpdateInput }) => updateProductCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORIES_KEY });
      toast.success("Category updated");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProductCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORIES_KEY });
      toast.success("Category deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}
