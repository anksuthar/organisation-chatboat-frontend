"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, RefreshCw, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentReplaceDialog } from "@/components/documents/document-replace-dialog";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { QueryError } from "@/components/shared/query-error";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteDocument, useDocument, useReprocessDocument } from "@/hooks/use-documents";

export function DocumentDetail({ documentId }: { documentId: number }) {
  const router = useRouter();
  const documentQuery = useDocument(documentId);
  const { data: document, isError } = documentQuery;
  const { data: categories } = useCategories();
  const reprocessDocument = useReprocessDocument();
  const deleteDocument = useDeleteDocument();
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isError && !document) {
    return (
      <QueryError error={documentQuery.error} onRetry={() => documentQuery.refetch()} notFoundLabel="Document" />
    );
  }

  if (!document) {
    return <Skeleton className="h-64 w-full" />;
  }

  const categoryName = categories?.find((c) => c.id === document.category_id)?.name ?? `#${document.category_id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{document.title}</h1>
          <p className="text-sm text-muted-foreground">{document.filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setReplaceOpen(true)}>
            <Upload />
            Replace
          </Button>
          <Button
            variant="outline"
            disabled={reprocessDocument.isPending}
            onClick={() => reprocessDocument.mutate(document.id)}
          >
            <RefreshCw />
            Reprocess
          </Button>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="text-destructive" />
            Delete
          </Button>
        </div>
      </div>

      {document.status === "failed" && document.error_message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Processing failed</AlertTitle>
          <AlertDescription>{document.error_message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentStatusBadge status={document.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">{categoryName}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pages</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">{document.total_pages ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chunks embedded</CardTitle>
          </CardHeader>
          <CardContent className="font-medium">
            {document.status === "processed" ? document.chunks.length : "—"}
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
      </p>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Extracted chunks</h2>
        {document.chunks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {document.status === "processed" ? "No chunks were extracted." : "Chunks will appear once processing finishes."}
          </p>
        ) : (
          <ScrollArea className="h-96 rounded-lg border">
            <div className="divide-y">
              {document.chunks.map((chunk) => (
                <div key={chunk.id} className="p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Chunk #{chunk.chunk_index}</span>
                    <span>·</span>
                    <span>Page {chunk.page_number}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{chunk.chunk_text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <DocumentReplaceDialog documentId={document.id} open={replaceOpen} onOpenChange={setReplaceOpen} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{document.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the file, its extracted chunks, and its vectors. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteDocument.isPending}
              onClick={async () => {
                try {
                  await deleteDocument.mutateAsync(document.id);
                } catch {
                  return; // toast shown by hook
                }
                router.push("/admin/documents");
              }}
            >
              {deleteDocument.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
