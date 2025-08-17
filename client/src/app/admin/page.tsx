"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  FolderTree,
  Tag,
  Star,
  Menu,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

// Define a type for the order data to ensure type safety
interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
}

// Define a type for the product data
interface Product {
  _id: string;
  createdAt: string;
  quantity: number;
}

// StatCard component for displaying a single metric
type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  changeColor: string;
  icon: React.ElementType;
  description?: string;
};

const StatCard = ({
  title,
  value,
  change,
  changeColor,
  icon: Icon,
  description,
}: StatCardProps) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="p-6 pt-0">
      <div className="text-2xl font-bold">{value}</div>
      {change && description && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <TrendingUp className={cn("h-3 w-3", changeColor)} />
          <span className={cn("font-medium", changeColor)}>{change}</span>
          <span>{description}</span>
        </div>
      )}
    </div>
  </div>
);

// ActionCard component for quick navigation links
type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
};

const ActionCard = ({ title, description, icon: Icon, href }: ActionCardProps) => {
  const router = useRouter();

  return (
    <div
      className="rounded-lg bg-card text-card-foreground shadow-sm group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border hover:border-blue-500/30"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col p-6 text-center pb-4 space-y-3">
        <div className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="space-y-1">
          <h3 className="tracking-tight text-base md:text-lg font-semibold group-hover:text-blue-500 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground group-hover:text-muted-foreground/80">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State for fetching and calculated data for orders
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<number | null>(null);
  const [revenueChangeColor, setRevenueChangeColor] = useState<string>("");

  const [currentMonthOrders, setCurrentMonthOrders] = useState<number | null>(null);
  const [ordersGrowth, setOrdersGrowth] = useState<number | null>(null);
  const [ordersChangeColor, setOrdersChangeColor] = useState<string>("");

  // State for fetching and calculated data for products
  // Updated state variable to hold the total number of products
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [productsGrowth, setProductsGrowth] = useState<number | null>(null);
  const [productsChangeColor, setProductsChangeColor] = useState<string>("");
  const [outOfStockProducts, setOutOfStockProducts] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch and process data from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Use Promise.all to fetch both orders and products concurrently
        const [ordersResponse, productsResponse] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/product/all"),
        ]);

        if (ordersResponse.status !== 200 || productsResponse.status !== 200) {
          throw new Error("Network response was not ok");
        }

        const allOrders: Order[] = ordersResponse.data.data;
        const allProducts: Product[] = productsResponse.data.data;

        // Filter out pending orders
        const paidOrders = allOrders.filter(order => order.status === "paid");

        // Get dates for the current and previous month
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = startOfCurrentMonth;

        // === Process Order Data ===
        const ordersCurrentMonth = paidOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startOfCurrentMonth && orderDate < now;
        });

        const ordersLastMonth = paidOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startOfLastMonth && orderDate < endOfLastMonth;
        });

        const revenueCurrentMonth = ordersCurrentMonth.reduce((sum, order) => sum + order.totalAmount, 0);
        const revenueLastMonth = ordersLastMonth.reduce((sum, order) => sum + order.totalAmount, 0);
        const countCurrentMonthOrders = ordersCurrentMonth.length;
        const countLastMonthOrders = ordersLastMonth.length;

        const calculatedRevenueGrowth = revenueLastMonth > 0 ? ((revenueCurrentMonth - revenueLastMonth) / revenueLastMonth) * 100 : (revenueCurrentMonth > 0 ? 100 : 0);
        const calculatedRevenueChangeColor = calculatedRevenueGrowth >= 0 ? "text-emerald-500" : "text-red-500";

        const calculatedOrdersGrowth = countLastMonthOrders > 0 ? ((countCurrentMonthOrders - countLastMonthOrders) / countLastMonthOrders) * 100 : (countCurrentMonthOrders > 0 ? 100 : 0);
        const calculatedOrdersChangeColor = calculatedOrdersGrowth >= 0 ? "text-emerald-500" : "text-red-500";

        // === Process Product Data ===
        // The total number of all products uploaded by the vendor
        const totalProductsCount = allProducts.length;

        // Filter products for the current and last month to calculate growth
        const productsCurrentMonth = allProducts.filter(product => {
          const productDate = new Date(product.createdAt);
          return productDate >= startOfCurrentMonth && productDate < now;
        });
        const productsLastMonth = allProducts.filter(product => {
          const productDate = new Date(product.createdAt);
          return productDate >= startOfLastMonth && productDate < endOfLastMonth;
        });

        const countCurrentMonthProducts = productsCurrentMonth.length;
        const countLastMonthProducts = productsLastMonth.length;

        // Calculate the growth of new products month-over-month
        const calculatedProductsGrowth = countLastMonthProducts > 0 ? ((countCurrentMonthProducts - countLastMonthProducts) / countLastMonthProducts) * 100 : (countCurrentMonthProducts > 0 ? 100 : 0);
        const calculatedProductsChangeColor = calculatedProductsGrowth >= 0 ? "text-emerald-500" : "text-red-500";

        const outOfStockCount = allProducts.filter(product => product.quantity === 0).length;

        // Update state with the new values
        setCurrentMonthRevenue(revenueCurrentMonth);
        setCurrentMonthOrders(countCurrentMonthOrders);
        setRevenueGrowth(calculatedRevenueGrowth);
        setOrdersGrowth(calculatedOrdersGrowth);
        setRevenueChangeColor(calculatedRevenueChangeColor);
        setOrdersChangeColor(calculatedOrdersChangeColor);
        setTotalProducts(totalProductsCount); // Updated to set the total product count
        setProductsGrowth(calculatedProductsGrowth);
        setProductsChangeColor(calculatedProductsChangeColor);
        setOutOfStockProducts(outOfStockCount);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Loading...";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to format percentage
  const formatPercentage = (value: number | null) => {
    if (value === null) return "Loading...";
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  // Loading state if data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const loadingText = "Loading...";

  return (
    <ProtectedRoute role="admin">
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 w-full bg-muted/40">
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            setMobileOpen={setIsMobileMenuOpen}
            setIsCollapsed={setIsSidebarCollapsed}
            isCollapsed={isSidebarCollapsed}
          />
          <div
            className={cn(
              "flex flex-1 flex-col transition-all duration-300 ease-in-out",
              isMobileMenuOpen ? "ml-0" : "",
              isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
            )}
          >
            <header className="md:hidden sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 z-30">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              <div className="space-y-8">
                <div className="text-center space-y-2 hidden md:block">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Monitor your store performance and manage operations
                  </p>
                </div>

                {/* STATS CARDS - Now dynamically populated */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {error ? (
                    <div className="col-span-4 text-center text-red-500">
                      Error: {error}
                    </div>
                  ) : (
                    <>
                      <StatCard
                        title="Total Revenue"
                        value={formatCurrency(currentMonthRevenue)}
                        change={formatPercentage(revenueGrowth)}
                        changeColor={revenueChangeColor}
                        icon={DollarSign}
                        description="from last month"
                      />
                      <StatCard
                        title="Total Orders"
                        value={currentMonthOrders !== null ? currentMonthOrders.toString() : loadingText}
                        change={formatPercentage(ordersGrowth)}
                        changeColor={ordersChangeColor}
                        icon={ShoppingCart}
                        description="from last month"
                      />
                      <StatCard
                        title="Total Products"
                        // Updated to show the total number of products
                        value={totalProducts !== null ? totalProducts.toString() : loadingText}
                        change={formatPercentage(productsGrowth)}
                        changeColor={productsChangeColor}
                        icon={Package}
                        // Updated description to be more accurate
                        description="from last month"
                      />
                      <StatCard
                        title="Products Out of Stock"
                        value={outOfStockProducts !== null ? outOfStockProducts.toString() : loadingText}
                        change={""}
                        changeColor="text-gray-500"
                        icon={Package}
                        description="products unavailable"
                      />
                    </>
                  )}
                </div>

                {/* QUICK ACTIONS */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl md:text-2xl font-semibold">
                      Quick Actions
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base mt-1">
                      Navigate to different sections of your admin panel
                    </p>
                  </div>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <ActionCard
                      title="Categories"
                      description="Manage product categories"
                      icon={FolderTree}
                      href="/admin/categories"
                    />
                    <ActionCard
                      title="Products"
                      description="Add and manage products"
                      icon={Package}
                      href="/admin/products"
                    />
                    <ActionCard
                      title="Orders"
                      description="View and manage orders"
                      icon={ShoppingCart}
                      href="/admin/orders"
                    />
                    <ActionCard
                      title="Promotions"
                      description="Create and manage promotions"
                      icon={Tag}
                      href="/admin/promotions"
                    />
                    <ActionCard
                      title="Reviews"
                      description="Manage customer reviews"
                      icon={Star}
                      href="/admin/reviews"
                    />
                  </div>
                </div>
              </div>
            </main>
          </div>
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
