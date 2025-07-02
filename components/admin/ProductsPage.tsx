"use client";

import React, { useState, useRef } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Package,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  Product,
  Category,
  ProductsResponse,
} from "@/lib/actions/products";

interface ProductsPageProps {
  initialData: ProductsResponse;
  categories: Category[];
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  initialData,
  categories,
}) => {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(data.currentPage);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: 0,
    quantityType: "limited" as "limited" | "unlimited",
    categoryId: "",
    info: "",
    details: [] as any[],
  });
  const [formImages, setFormImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(price));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const truncateText = (text: string | null, maxLength = 50) => {
    if (!text) return "No description";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      quantity: 0,
      quantityType: "limited",
      categoryId: "",
      info: "",
      details: [],
    });
    setFormImages([]);
    setExistingImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // In a real app, you'd make an API call here
      // For now, we'll just filter client-side
      window.location.href = `/admin/products?search=${encodeURIComponent(
        searchTerm
      )}&category=${selectedCategory}&page=1`;
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.set("search", searchTerm);
    if (selectedCategory) searchParams.set("category", selectedCategory);
    searchParams.set("page", page.toString());

    window.location.href = `/admin/products?${searchParams.toString()}`;
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity,
      quantityType: product.quantityType,
      categoryId: product.categoryId || "",
      info: product.info,
      details: product.details,
    });
    setExistingImages(product.images);
    setFormImages([]);
    setEditDialogOpen(true);
  };

  const handleCreateProduct = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    setLoading(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages =
      existingImages.length + formImages.length + files.length;

    if (totalImages > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setFormImages((prev) => [...prev, ...files]);
  };

  const removeFormImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageUrl: string) => {
    if (editingProduct) {
      setLoading(true);
      try {
        const result = await deleteProductImage(editingProduct.id, imageUrl);
        if (result.success) {
          setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
        } else {
          alert(result.error || "Failed to delete image");
        }
      } catch (error) {
        console.error("Delete image failed:", error);
        alert("Failed to delete image");
      } finally {
        setLoading(false);
      }
    } else {
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    }
  };

  const addDetailField = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { type: "text", label: "", required: false }],
    }));
  };

  const updateDetailField = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  const removeDetailField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("quantity", formData.quantity.toString());
      submitData.append("quantityType", formData.quantityType);
      submitData.append("categoryId", formData.categoryId);
      submitData.append("info", formData.info);
      submitData.append("details", JSON.stringify(formData.details));

      // Add images
      formImages.forEach((file) => {
        submitData.append("images", file);
      });

      if (isEdit && editingProduct) {
        submitData.append("existingImages", JSON.stringify(existingImages));
        const result = await updateProduct(editingProduct.id, submitData);
        if (result.success) {
          setEditDialogOpen(false);
          window.location.reload();
        } else {
          alert(result.error || "Failed to update product");
        }
      } else {
        const result = await createProduct(submitData);
        if (result.success) {
          setCreateDialogOpen(false);
          window.location.reload();
        } else {
          alert(result.error || "Failed to create product");
        }
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const renderDetailField = (detail: any, index: number) => {
    return (
      <div key={index} className="border p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Detail Field {index + 1}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeDetailField(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select
              value={detail.type}
              onValueChange={(value) => updateDetailField(index, "type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Label</Label>
            <Input
              value={detail.label}
              onChange={(e) =>
                updateDetailField(index, "label", e.target.value)
              }
              placeholder="Field label"
            />
          </div>
        </div>

        {(detail.type === "select" || detail.type === "checkbox") && (
          <div>
            <Label>Options (one per line)</Label>
            <Textarea
              value={detail.options?.join("\n") || ""}
              onChange={(e) =>
                updateDetailField(
                  index,
                  "options",
                  e.target.value.split("\n").filter(Boolean)
                )
              }
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`required-${index}`}
            checked={detail.required || false}
            onChange={(e) =>
              updateDetailField(index, "required", e.target.checked)
            }
          />
          <Label htmlFor={`required-${index}`}>Required field</Label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products Management
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Products Table */}
          {data.products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {truncateText(product.description)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(product.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              product.quantity > 0 ? "default" : "destructive"
                            }
                          >
                            {product.quantityType === "unlimited"
                              ? "Unlimited"
                              : `${product.quantity} units`}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {product.quantityType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.categoryName ? (
                          <Badge variant="outline">
                            {product.categoryName}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No category
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Image className="h-4 w-4" />
                          <span className="text-sm">
                            {product.images.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(product.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={loading}
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
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {(data.currentPage - 1) * 10 + 1} to{" "}
                {Math.min(data.currentPage * 10, data.totalCount)} of{" "}
                {data.totalCount} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  disabled={data.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  disabled={data.currentPage >= data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Name
                  </Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Price
                  </Label>
                  <p className="font-medium text-green-600">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Description
                </Label>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedProduct.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Stock
                  </Label>
                  <Badge
                    variant={
                      selectedProduct.quantity > 0 ? "default" : "destructive"
                    }
                  >
                    {selectedProduct.quantityType === "unlimited"
                      ? "Unlimited"
                      : `${selectedProduct.quantity} units`}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Type
                  </Label>
                  <p className="text-sm capitalize">
                    {selectedProduct.quantityType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Category
                  </Label>
                  <p className="text-sm">
                    {selectedProduct.categoryName || "No category"}
                  </p>
                </div>
              </div>

              {selectedProduct.info && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Additional Info
                  </Label>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {selectedProduct.info}
                  </p>
                </div>
              )}

              {selectedProduct.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Images
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.details.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Product Details
                  </Label>
                  <div className="space-y-2 mt-2">
                    {selectedProduct.details.map((detail, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded bg-gray-50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {detail.label}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {detail.type}
                          </Badge>
                          {detail.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {detail.options && (
                          <div className="text-xs text-gray-600">
                            Options: {detail.options.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Created
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedProduct.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Updated
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedProduct.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Product Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product information"
                : "Add a new product to your inventory"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => handleSubmit(e, !!editingProduct)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  disabled={formData.quantityType === "unlimited"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityType">Quantity Type</Label>
                <Select
                  value={formData.quantityType}
                  onValueChange={(value: "limited" | "unlimited") =>
                    setFormData((prev) => ({ ...prev, quantityType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="info">Additional Information</Label>
              <Textarea
                id="info"
                value={formData.info}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, info: e.target.value }))
                }
                placeholder="Enter additional product information"
                rows={2}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Images (Max 5)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={existingImages.length + formImages.length >= 5}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">
                    Current Images
                  </Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeExistingImage(image)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {formImages.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">New Images</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {formImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeFormImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Details</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDetailField}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Detail Field
                </Button>
              </div>

              {formData.details.length > 0 && (
                <div className="space-y-4">
                  {formData.details.map((detail, index) =>
                    renderDetailField(detail, index)
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
