import { getUsersData } from "@/lib/actions/users";
import UsersPage from "@/components/admin/UsersPage";

export default async function AdminUsersPage() {
  const users = await getUsersData();

  return (
    <div className="container mx-auto py-6">
      <UsersPage initialUsers={users} />
    </div>
  );
}

export const metadata = {
  title: "Users Management",
  description: "Manage and view all users in your system",
};
