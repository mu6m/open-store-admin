"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";

export default function LogoutButton() {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <Button
      className="my-2 mx-2 w-[7rem]"
      variant="outline"
      size="sm"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
