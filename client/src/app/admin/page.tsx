"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Eye,
  FolderTree,
  Package,
  Tag,
  Star,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation"; // Import useRouter

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter(); // Initialize useRouter

  return (
    <ProtectedRoute role="admin">
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 w-full bg-muted/40">
        {/* Sidebar Component */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          setMobileOpen={setIsMobileMenuOpen}
          setIsCollapsed={setIsSidebarCollapsed}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Main Content */}
        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "ml-0" : "",
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          )}
        >
          {/* Mobile Header with Toggle Button */}
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

          {/* The rest of your main content */}
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

              {/* STATS CARDS */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Revenue"
                  value="$45,231.89"
                  change="+20.1%"
                  changeColor="text-emerald-500"
                  icon={DollarSign}
                  description="from last month"
                />
                <StatCard
                  title="Total Orders"
                  value="2,350"
                  change="+180.1%"
                  changeColor="text-emerald-500"
                  icon={ShoppingCart}
                  description="from last month"
                />
                <StatCard
                  title="Active Users"
                  value="12,234"
                  change="+19%"
                  changeColor="text-emerald-500"
                  icon={Users}
                  description="from last month"
                />
                <StatCard
                  title="Page Views"
                  value="573,294"
                  change="+201"
                  changeColor="text-emerald-500"
                  icon={Eye}
                  description="from last month"
                />
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
                    href="/admin/categories" // Added href
                  />
                  <ActionCard
                    title="Products"
                    description="Add and manage products"
                    icon={Package}
                    href="/admin/products" // Added href
                  />
                  <ActionCard
                    title="Orders"
                    description="View and manage orders"
                    icon={ShoppingCart}
                    href="/admin/orders" // Added href
                  />
                  <ActionCard
                    title="Promotions"
                    description="Create and manage promotions"
                    icon={Tag}
                    href="/admin/promotions" // Added href
                  />
                  <ActionCard
                    title="Reviews"
                    description="Manage customer reviews"
                    icon={Star}
                    href="/admin/reviews" // Added href
                  />
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Backdrop for mobile overlay */}
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

// === Sub-components (StatCard, ActionCard) ===

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  changeColor: string;
  icon: React.ElementType;
  description: string;
};

const StatCard = ({ title, value, change, changeColor, icon: Icon, description }: StatCardProps) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <div className="p-6 pt-0">
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
        <TrendingUp className={cn("h-3 w-3", changeColor)} />
        <span className={cn("font-medium", changeColor)}>{change}</span>
        <span>{description}</span>
      </div>
    </div>
  </div>
);

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string; // Added href prop
};

const ActionCard = ({ title, description, icon: Icon, href }: ActionCardProps) => {
  const router = useRouter(); // Initialize useRouter inside ActionCard

  return (
    <div
      className="rounded-lg bg-card text-card-foreground shadow-sm group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border hover:border-blue-500/30"
      onClick={() => router.push(href)} // Add onClick to redirect
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
