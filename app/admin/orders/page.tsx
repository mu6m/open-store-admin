import { getOrdersData } from "@/lib/actions/orders";
import OrdersPage from "@/components/admin/OrdersPage";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    userId?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search;
  const userId = params.userId;

  const ordersData = await getOrdersData(page, 10, search, userId);

  return (
    <div className="container mx-auto py-6">
      <OrdersPage initialData={ordersData} userId={userId} />
    </div>
  );
}
