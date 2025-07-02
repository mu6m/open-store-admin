"use client";

import React, { useState } from "react";
import { Search, Eye, User, Phone, MapPin, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User as UserType } from "@/lib/actions/users";

interface UsersPageProps {
  initialUsers: UserType[];
}

const UsersPage: React.FC<UsersPageProps> = ({ initialUsers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter users based on search (client-side filtering)
  const filteredUsers = initialUsers.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.id.toLowerCase().includes(search) ||
      user.number?.toLowerCase().includes(search) ||
      user.address?.toLowerCase().includes(search)
    );
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const truncateText = (text: string | null, maxLength = 40) => {
    if (!text) return "Not provided";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getOrdersBadgeVariant = (count: number) => {
    if (count === 0) return "secondary";
    if (count < 5) return "outline";
    if (count < 15) return "default";
    return "destructive";
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Users Management
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by ID, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          {user.id}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.number ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {user.number}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Not provided
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.address ? (
                          <div className="flex items-center gap-1 text-sm max-w-xs">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate" title={user.address}>
                              {truncateText(user.address, 50)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Not provided
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOrdersBadgeVariant(user.orderCount)}>
                          {user.orderCount} orders
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {user.orderCount > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/admin/orders?userId=${user.id}`)
                              }
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Orders
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    User ID
                  </label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {selectedUser.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <p className="text-sm p-2">
                    {selectedUser.number || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Address
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedUser.address || "Not provided"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created
                    </label>
                    <p className="text-sm">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Updated
                    </label>
                    <p className="text-sm">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Total Orders
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={getOrdersBadgeVariant(selectedUser.orderCount)}
                      >
                        {selectedUser.orderCount} orders
                      </Badge>
                    </div>
                  </div>
                  {selectedUser.orderCount > 0 && (
                    <Button
                      onClick={() => {
                        window.location.href = `/admin/orders?userId=${selectedUser.id}`;
                        setDialogOpen(false);
                      }}
                      size="sm"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      View Orders
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
