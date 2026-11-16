import axios, { type AxiosProgressEvent } from "axios";

import { apiFetch } from "@/services/api-client";
import type { DocumentDetail, DocumentItem } from "@/types/document";

export function listDocuments(categoryId?: number): Promise<DocumentItem[]> {
  const query = categoryId ? `?category_id=${categoryId}` : "";
  return apiFetch(`documents${query}`);
}

export function getDocument(id: number): Promise<DocumentDetail> {
  return apiFetch(`documents/${id}`);
}

export async function uploadDocument({
  file,
  title,
  categoryId,
  onProgress,
}: {
  file: File;
  title: string;
  categoryId: number;
  onProgress?: (percent: number) => void;
}): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category_id", String(categoryId));
  formData.append("file", file);

  const { data } = await axios.post<DocumentItem>("/api/backend/documents/upload", formData, {
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return data;
}

export function replaceDocument(id: number, file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch(`documents/${id}/replace`, { method: "PUT", body: formData });
}

export function reprocessDocument(id: number): Promise<DocumentItem> {
  return apiFetch(`documents/reprocess/${id}`, { method: "POST" });
}

export function deleteDocument(id: number): Promise<void> {
  return apiFetch(`documents/${id}`, { method: "DELETE" });
}
