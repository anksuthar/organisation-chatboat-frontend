import { ProductDetailView } from "@/components/shop/product-detail-view";

export default async function ShopProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailView productId={Number(id)} />;
}
