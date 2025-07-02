import { getCategoriesData } from "@/lib/actions/categories";
import CategoriesPage from "@/components/admin/CategoriesPage";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesData();

  return (
    <div className="container mx-auto py-6">
      <CategoriesPage initialCategories={categories} />
    </div>
  );
}
