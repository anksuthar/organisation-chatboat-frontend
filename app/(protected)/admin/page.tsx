"use client";

import { CheckCircle2, Clock, FileX2, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useDocuments } from "@/hooks/use-documents";
import type { DocumentItem } from "@/types/document";

export default function AdminDashboardPage() {
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const { data: documents, isLoading: documentsLoading, isError: documentsError } = useDocuments();

  const countDocuments = (predicate: (d: DocumentItem) => boolean) => documents?.filter(predicate).length;

  // "…" while loading, "—" when the query failed (never a misleading 0).
  const display = (loading: boolean, error: boolean, value: number | undefined) =>
    loading ? "…" : error || value === undefined ? "—" : value;

  const stats = [
    { label: "Categories", value: display(categoriesLoading, categoriesError, categories?.length), icon: FolderKanban },
    {
      label: "Processed documents",
      value: display(documentsLoading, documentsError, countDocuments((d) => d.status === "processed")),
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: display(
        documentsLoading,
        documentsError,
        countDocuments((d) => d.status === "pending" || d.status === "processing")
      ),
      icon: Clock,
    },
    {
      label: "Failed",
      value: display(documentsLoading, documentsError, countDocuments((d) => d.status === "failed")),
      icon: FileX2,
    },
  ];
  const loadFailed = categoriesError || documentsError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <Button render={<Link href="/admin/documents/upload" />}>
          <Plus />
          Upload document
        </Button>
      </div>

      {loadFailed && (
        <p role="alert" className="text-sm text-destructive">
          Some counts couldn&apos;t be loaded. Refresh the page to try again.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Manage <Link href="/admin/categories" className="underline">categories</Link> and{" "}
        <Link href="/admin/documents" className="underline">documents</Link> from the sidebar.
      </p>
    </div>
  );
}
