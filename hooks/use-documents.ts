"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteDocument,
  getDocument,
  listDocuments,
  replaceDocument,
  reprocessDocument,
  uploadDocument,
} from "@/services/documents";
import type { DocumentItem } from "@/types/document";

const DOCUMENTS_KEY = ["documents"] as const;

const IN_PROGRESS_REFETCH_MS = 3000;

function hasInFlightDocument(documents: DocumentItem[] | undefined): boolean {
  return !!documents?.some((doc) => doc.status === "pending" || doc.status === "processing");
}

export function useDocuments(categoryId?: number) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, categoryId ?? "all"],
    queryFn: () => listDocuments(categoryId),
    refetchInterval: (query) => (hasInFlightDocument(query.state.data) ? IN_PROGRESS_REFETCH_MS : false),
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, id],
    queryFn: () => getDocument(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? IN_PROGRESS_REFETCH_MS : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (input: { file: File; title: string; categoryId: number }) =>
      uploadDocument({ ...input, onProgress: setProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success("Document uploaded — processing started");
      setProgress(0);
    },
    onError: (error) => {
      toast.error(error.message);
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

export function useReplaceDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => replaceDocument(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success("Document replaced — reprocessing started");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useReprocessDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reprocessDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success("Reprocessing started");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      toast.success("Document deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}
