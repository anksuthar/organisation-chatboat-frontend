export type DocumentStatus = "pending" | "processing" | "processed" | "failed";

export interface DocumentItem {
  id: number;
  title: string;
  filename: string;
  category_id: number;
  uploaded_by: number | null;
  total_pages: number | null;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
}

export interface Chunk {
  id: number;
  page_number: number;
  chunk_index: number;
  chunk_text: string;
}

export interface DocumentDetail extends DocumentItem {
  chunks: Chunk[];
}
