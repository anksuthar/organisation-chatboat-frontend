"use client";

import { CheckCircle2, Clock, FileX2, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useDocuments } from "@/hooks/use-documents";

export default function AdminDashboardPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: documents, isLoading: documentsLoading } = useDocuments();

  const processedCount = documents?.filter((d) => d.status === "processed").length ?? 0;
  const inFlightCount = documents?.filter((d) => d.status === "pending" || d.status === "processing").length ?? 0;
  const failedCount = documents?.filter((d) => d.status === "failed").length ?? 0;

  const stats = [
    { label: "Categories", value: categoriesLoading ? "…" : categories?.length ?? 0, icon: FolderKanban },
    { label: "Processed documents", value: documentsLoading ? "…" : processedCount, icon: CheckCircle2 },
    { label: "In progress", value: documentsLoading ? "…" : inFlightCount, icon: Clock },
    { label: "Failed", value: documentsLoading ? "…" : failedCount, icon: FileX2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <Button render={<Link href="/admin/documents/upload" />}>
          <Plus />
          Upload document
        </Button>
      </div>

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
