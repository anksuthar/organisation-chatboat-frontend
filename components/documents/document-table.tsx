"use client";

import { formatDistanceToNow } from "date-fns";
import { Eye, Plus, RefreshCw, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteDocument, useDocuments, useReprocessDocument } from "@/hooks/use-documents";
import type { DocumentItem } from "@/types/document";

export function DocumentTable() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { data: categories } = useCategories();
  const { data: documents, isLoading } = useDocuments(
    categoryFilter === "all" ? undefined : Number(categoryFilter)
  );
  const reprocessDocument = useReprocessDocument();
  const deleteDocument = useDeleteDocument();
  const [deletingDocument, setDeletingDocument] = useState<DocumentItem | null>(null);

  const categoryName = (categoryId: number) =>
    categories?.find((c) => c.id === categoryId)?.name ?? `#${categoryId}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
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
          <Button render={<Link href="/admin/documents/upload" />}>
            <Plus />
            Upload
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && documents?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No documents yet.
                </TableCell>
              </TableRow>
            )}

            {documents?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell className="text-muted-foreground">{categoryName(doc.category_id)}</TableCell>
                <TableCell className="text-muted-foreground">{doc.total_pages ?? "—"}</TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${doc.title}`}
                    render={<Link href={`/admin/documents/${doc.id}`} />}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Reprocess ${doc.title}`}
                    disabled={reprocessDocument.isPending}
                    onClick={() => reprocessDocument.mutate(doc.id)}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${doc.title}`}
                    onClick={() => setDeletingDocument(doc)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(deletingDocument)} onOpenChange={(open) => !open && setDeletingDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deletingDocument?.title}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the file, its extracted chunks, and its vectors. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingDocument) deleteDocument.mutate(deletingDocument.id);
                setDeletingDocument(null);
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
