"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ErrorCode, useDropzone, type FileRejection } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useUploadDocument } from "@/hooks/use-documents";
import { cn } from "@/lib/utils";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  categoryId: z.string().min(1, "Category is required"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function rejectionMessage(rejections: FileRejection[]): string {
  const codes = rejections.flatMap((rejection) => rejection.errors.map((error) => error.code));
  if (codes.includes(ErrorCode.TooManyFiles)) return "Drop a single PDF file.";
  if (codes.includes(ErrorCode.FileInvalidType)) return "Only PDF files are allowed.";
  if (codes.includes(ErrorCode.FileTooLarge)) return "File is larger than the 20MB limit.";
  return rejections[0]?.errors[0]?.message ?? "This file can't be uploaded.";
}

export function DocumentUploadForm() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const upload = useUploadDocument();
  const [file, setFile] = useState<File | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", categoryId: "" },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        setDropError(rejectionMessage(fileRejections));
        return;
      }
      const dropped = acceptedFiles[0];
      if (!dropped) return;
      setDropError(null);
      setFile(dropped);
      if (!form.getValues("title")) {
        form.setValue("title", dropped.name.replace(/\.pdf$/i, ""));
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  async function onSubmit(values: UploadFormValues) {
    // Submit is disabled until a file is selected; this only narrows the type.
    if (!file) return;
    try {
      await upload.mutateAsync({ file, title: values.title, categoryId: Number(values.categoryId) });
    } catch {
      return; // toast shown by hook; stay on the upload page
    }
    router.push("/admin/documents");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Upload document</h1>

      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border",
          file && "border-emerald-500/50 bg-emerald-500/5"
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <>
            <FileText className="size-8 text-emerald-600" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="size-4" />
              Remove
            </Button>
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="font-medium">Drag & drop a PDF here, or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF only, up to 20MB</p>
          </>
        )}
      </div>
      {dropError && (
        <p role="alert" className="-mt-4 text-sm text-destructive">
          {dropError}
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Leave Policy 2026" {...field} />
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
                <Select value={field.value} onValueChange={(value) => field.onChange(value ?? "")}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
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

          {upload.isPending && <Progress value={upload.progress} />}

          <Button type="submit" disabled={upload.isPending || !file} className="w-full">
            {upload.isPending ? `Uploading… ${upload.progress}%` : "Upload"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
