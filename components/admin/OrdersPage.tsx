"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Package,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Order,
  OrdersResult,
  createOrder,
  updateOrder,
  deleteOrder,
  getUsersForSelect,
  getProductsForSelect,
} from "@/lib/actions/orders";

interface OrdersPageProps {
  initialData: OrdersResult;
  userId?: string;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ initialData, userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [ordersData, setOrdersData] = useState(initialData);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [users, setUsers] = useState<
    Array<{ id: string; number: string | null }>
  >([]);
  const [products, setProducts] = useState<
    Array<{ id: string; name: string; price: string }>
  >([]);
  const [createForm, setCreateForm] = useState({
    userId: "",
    productId: "",
    quantity: 1,
    price: "",
    status: "checking order",
    selectedDetails: "{}",
  });
  const [editForm, setEditForm] = useState({
    quantity: 1,
    price: "",
    status: "",
    selectedDetails: "{}",
  });

  // Load users and products for dropdowns
  useEffect(() => {
    const loadData = async () => {
      const [usersData, productsData] = await Promise.all([
        getUsersForSelect(),
        getProductsForSelect(),
      ]);
      setUsers(usersData);
      setProducts(productsData);
    };
    loadData();
  }, []);

  const refreshData = () => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", currentPage.toString());
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    if (userId) params.set("userId", userId);

    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  const handleSearch = () => {
    setCurrentPage(1);
    refreshData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refreshData();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(price));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";
      case "shipped":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "checking order":
        return "outline";
      default:
        return "outline";
    }
  };

  const truncateText = (text: string | null, maxLength = 30) => {
    if (!text) return "Not provided";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleCreateOrder = async () => {
    try {
      const result = await createOrder({
        userId: createForm.userId,
        productId: createForm.productId,
        quantity: createForm.quantity,
        price: createForm.price,
        status: createForm.status,
        selectedDetails: JSON.parse(createForm.selectedDetails || "{}"),
      });

      if (result.success) {
        setShowCreateDialog(false);
        setCreateForm({
          userId: "",
          productId: "",
          quantity: 1,
          price: "",
          status: "checking order",
          selectedDetails: "{}",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      const result = await updateOrder(editingOrder.id, {
        quantity: editForm.quantity,
        price: editForm.price,
        status: editForm.status,
        selectedDetails: JSON.parse(editForm.selectedDetails || "{}"),
      });

      if (result.success) {
        setShowEditDialog(false);
        setEditingOrder(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      const result = await deleteOrder(selectedOrder.id);
      if (result.success) {
        setShowDeleteDialog(false);
        setSelectedOrder(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowViewDialog(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditForm({
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      selectedDetails: JSON.stringify(order.selectedDetails, null, 2),
    });
    setShowEditDialog(true);
  };

  const handleShowAddress = (order: Order) => {
    setSelectedOrder(order);
    setShowAddressDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders Management
                {userId && <Badge variant="outline">User: {userId}</Badge>}
              </div>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                Search
              </Button>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersData.orders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No orders found matching your search"
                  : "No orders found"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-medium">
                            {order.id.substring(0, 8)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {order.userId}
                            </div>
                            {order.user?.number && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                {order.user.number}
                              </div>
                            )}
                            {order.user?.address && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <button
                                  onClick={() => handleShowAddress(order)}
                                  className="hover:underline"
                                >
                                  {truncateText(order.user.address)}
                                </button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {order.product.name}
                            </div>
                            {order.product.category && (
                              <div className="text-xs text-gray-500">
                                {order.product.category.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.quantity}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(order.price)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {ordersData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, ordersData.totalCount)} of{" "}
                    {ordersData.totalCount} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {ordersData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === ordersData.totalPages || loading
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Add a new order to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User</Label>
              <Select
                value={createForm.userId}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, userId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.id} {user.number && `(${user.number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productId">Product</Label>
              <Select
                value={createForm.productId}
                onValueChange={(value) => {
                  const product = products.find((p) => p.id === value);
                  setCreateForm((prev) => ({
                    ...prev,
                    productId: value,
                    price: product?.price || "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={createForm.quantity}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                step="0.01"
                value={createForm.price}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking order">Checking Order</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Order ID
                    </Label>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                      {selectedOrder.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        variant={getStatusBadgeVariant(selectedOrder.status)}
                      >
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Quantity
                    </Label>
                    <p className="text-sm">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Price
                    </Label>
                    <p className="text-sm font-medium">
                      {formatPrice(selectedOrder.price)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Customer
                    </Label>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-mono text-sm">
                        {selectedOrder.user.id}
                      </p>
                      {selectedOrder.user.number && (
                        <p className="text-sm flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {selectedOrder.user.number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Product
                    </Label>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-sm">
                        {selectedOrder.product.name}
                      </p>
                      {selectedOrder.product.category && (
                        <p className="text-xs text-gray-500">
                          {selectedOrder.product.category.name}
                        </p>
                      )}
                      <p className="text-sm mt-1">
                        Base Price: {formatPrice(selectedOrder.product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.user.address && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Customer Address
                  </Label>
                  <div className="bg-gray-50 p-3 rounded text-sm mt-1">
                    {selectedOrder.user.address}
                  </div>
                </div>
              )}

              {selectedOrder.selectedDetails &&
                Object.keys(selectedOrder.selectedDetails).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Selected Details
                    </Label>
                    <pre className="bg-gray-50 p-3 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify(selectedOrder.selectedDetails, null, 2)}
                    </pre>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Created
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Updated
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedOrder.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order information</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Order ID
                </Label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {editingOrder.id}
                </p>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking order">
                      Checking Order
                    </SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="selectedDetails">Selected Details (JSON)</Label>
                <Textarea
                  value={editForm.selectedDetails}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      selectedDetails: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="{}"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="bg-gray-50 p-4 rounded">
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Order ID:</strong> {selectedOrder.id}
                </p>
                <p className="text-sm">
                  <strong>Customer:</strong> {selectedOrder.user.id}
                </p>
                <p className="text-sm">
                  <strong>Product:</strong> {selectedOrder.product.name}
                </p>
                <p className="text-sm">
                  <strong>Total:</strong> {formatPrice(selectedOrder.price)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Customer Address
            </DialogTitle>
            <DialogDescription>
              Full address for {selectedOrder?.user.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder?.user.address && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {selectedOrder.user.address}
                </p>
              </div>
              {selectedOrder.user.number && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>Contact: {selectedOrder.user.number}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
