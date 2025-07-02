import { getOrdersData } from "@/lib/actions/orders";
import OrdersPage from "@/components/admin/OrdersPage";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    userId?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search;
  const userId = searchParams.userId;

  const ordersData = await getOrdersData(page, 10, search, userId);

  return (
    <div className="container mx-auto py-6">
      <OrdersPage initialData={ordersData} userId={userId} />
    </div>
  );
}
