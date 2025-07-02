"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  Folder,
  ChevronDown,
  Settings,
  Bell,
  Search,
  User,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";

// Mock Button component
const Button = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  onClick,
  ...props
}: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${
      variant === "ghost"
        ? "hover:bg-accent hover:text-accent-foreground"
        : "bg-primary text-primary-foreground hover:bg-primary/90"
    } ${size === "sm" ? "h-9 px-3" : "h-10 py-2 px-4"} ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

// Mock Badge component
const Badge = ({ variant = "default", className = "", children }: any) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === "destructive"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-800"
    } ${className}`}
  >
    {children}
  </span>
);

const AdminDashboardLayout = ({ children }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  const navigationItems = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      href: "/admin/",
      badge: null,
      description: "Manage customer accounts and profiles",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Folder,
      href: "/admin/categories",
      badge: null,
      description: "Organize products by categories",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      href: "/admin/products",
      badge: null,
      description: "Manage inventory and product details",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      href: "/admin/orders",
      badge: null,
      description: "Track and manage customer orders",
    },
    // {
    //   id: "cart-items",
    //   label: "Cart Items",
    //   icon: ShoppingCart,
    //   href: "/admin/cart-items",
    //   badge: null,
    //   description: "View active shopping cart contents",
    // },
  ];

  // Update current path when component mounts and when URL changes
  useEffect(() => {
    const updateCurrentPath = () => {
      setCurrentPath(window.location.pathname);
    };

    updateCurrentPath();

    // Listen for navigation changes (for client-side routing)
    window.addEventListener("popstate", updateCurrentPath);

    // For Next.js router events (if using Next.js)
    // You might need to import and use Next.js router events here

    return () => {
      window.removeEventListener("popstate", updateCurrentPath);
    };
  }, []);

  // Determine active item based on current path
  const getActiveItem = () => {
    const activeNavItem = navigationItems.find((item) => {
      // Handle exact match for root admin path
      if (item.href === "/admin/" && currentPath === "/admin/") {
        return true;
      }
      // Handle other paths
      if (item.href !== "/admin/" && currentPath.startsWith(item.href)) {
        return true;
      }
      return false;
    });

    return activeNavItem ? activeNavItem.id : "users"; // Default to users if no match
  };

  const activeItem = getActiveItem();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col w-64">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 group ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? "text-blue-700"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    <span className="flex-1 text-left truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge
                        variant={
                          item.badge === "Hot" ? "destructive" : "secondary"
                        }
                        className="ml-2 text-xs flex-shrink-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@company.com
                </p>
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation bar for mobile */}
        <div className="lg:hidden h-16 flex-shrink-0"></div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeItem.replace("-", " ")}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {navigationItems.find((item) => item.id === activeItem)
                    ?.description ||
                    "Manage your e-commerce platform from this dashboard"}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
