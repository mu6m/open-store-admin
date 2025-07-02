"use client";

import React, { useState } from "react";
import {
  Search,
  Eye,
  Plus,
  Edit,
  Trash2,
  Tag,
  Package,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Category,
  createCategory,
  updateCategory,
  deleteCategory,
  CreateCategoryData,
  UpdateCategoryData,
} from "@/lib/actions/categories";

interface CategoriesPageProps {
  initialCategories: Category[];
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({
  initialCategories,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Filter categories based on search (client-side filtering)
  const filteredCategories = categories.filter((category) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(search) ||
      category.description?.toLowerCase().includes(search)
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

  const truncateText = (text: string | null, maxLength = 60) => {
    if (!text) return "No description";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getProductsBadgeVariant = (count: number) => {
    if (count === 0) return "secondary";
    if (count < 5) return "outline";
    if (count < 20) return "default";
    return "destructive";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleViewCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Category created successfully");
        setCreateDialogOpen(false);
        resetForm();
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to create category");
      }
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateCategory({
        id: selectedCategory.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        toast.success("Category updated successfully");
        setEditDialogOpen(false);
        resetForm();
        setSelectedCategory(null);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      const result = await deleteCategory(selectedCategory.id);

      if (result.success) {
        toast.success("Category deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categories Management
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No categories found matching your search"
                  : "No categories found"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first category
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="font-medium">{category.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {truncateText(category.description)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getProductsBadgeVariant(
                            category.productCount
                          )}
                        >
                          {category.productCount} products
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(category.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(category.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={category.productCount > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          {category.productCount > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                (window.location.href = `/admin/products?categoryId=${category.id}`)
                              }
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Products
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

      {/* View Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedCategory?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category ID
                  </label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                    {selectedCategory.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <p className="text-sm font-medium p-2">
                    {selectedCategory.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {selectedCategory.description || "No description provided"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Created
                    </label>
                    <p className="text-sm">
                      {formatDate(selectedCategory.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Updated
                    </label>
                    <p className="text-sm">
                      {formatDate(selectedCategory.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Products
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={getProductsBadgeVariant(
                          selectedCategory.productCount
                        )}
                      >
                        {selectedCategory.productCount} products
                      </Badge>
                    </div>
                  </div>
                  {selectedCategory.productCount > 0 && (
                    <Button
                      onClick={() => {
                        window.location.href = `/admin/products?categoryId=${selectedCategory.id}`;
                        setDialogOpen(false);
                      }}
                      size="sm"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      View Products
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Category
            </DialogTitle>
            <DialogDescription>
              Add a new category to organize your products
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Category
            </DialogTitle>
            <DialogDescription>Update category information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter category description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                resetForm();
                setSelectedCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCategory}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "
              {selectedCategory?.name}"? This action cannot be undone.
              {selectedCategory && selectedCategory.productCount > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  <strong>Warning:</strong> This category contains{" "}
                  {selectedCategory.productCount} products. You cannot delete a
                  category with existing products.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              disabled={
                isLoading ||
                (selectedCategory !== null && selectedCategory.productCount > 0)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;
