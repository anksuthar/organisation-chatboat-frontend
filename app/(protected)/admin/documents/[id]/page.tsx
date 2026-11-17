import { notFound } from "next/navigation";

import { DocumentDetail } from "@/components/documents/document-detail";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <DocumentDetail documentId={Number(id)} />;
}
