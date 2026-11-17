"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useReplaceDocument } from "@/hooks/use-documents";

const replaceSchema = z.object({
  file: z
    .custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Select a PDF file")
    .refine(
      (file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
      "Only PDF files are allowed"
    ),
});

type ReplaceFormValues = z.infer<typeof replaceSchema>;

export function DocumentReplaceDialog({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const replaceDocument = useReplaceDocument();

  const form = useForm<ReplaceFormValues>({
    resolver: zodResolver(replaceSchema),
    defaultValues: { file: undefined },
  });

  // Clear any previously selected file whenever the dialog is (re)opened, so a cancelled
  // selection is never submitted later.
  useEffect(() => {
    if (open) {
      form.reset({ file: undefined });
    }
  }, [open, form]);

  async function onSubmit(values: ReplaceFormValues) {
    try {
      await replaceDocument.mutateAsync({ id: documentId, file: values.file });
    } catch {
      return; // toast shown by hook; keep the dialog open
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF file</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="application/pdf"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={replaceDocument.isPending}>
                {replaceDocument.isPending ? "Replacing…" : "Replace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
