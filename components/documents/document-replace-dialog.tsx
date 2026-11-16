"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useReplaceDocument } from "@/hooks/use-documents";

export function DocumentReplaceDialog({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const replaceDocument = useReplaceDocument();

  async function onSubmit() {
    if (!file) return;
    await replaceDocument.mutateAsync({ id: documentId, file });
    setFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace document</DialogTitle>
        </DialogHeader>
        <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!file || replaceDocument.isPending} onClick={onSubmit}>
            {replaceDocument.isPending ? "Replacing…" : "Replace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
