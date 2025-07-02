import { getProductsData, getCategoriesData } from "@/lib/actions/products";
import ProductsPage from "@/components/admin/ProductsPage";

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search;
  const categoryId = searchParams.category;

  const [productsData, categories] = await Promise.all([
    getProductsData(page, 10, search, categoryId),
    getCategoriesData(),
  ]);

  return (
    <div className="container mx-auto py-6">
      <ProductsPage initialData={productsData} categories={categories} />
    </div>
  );
}
