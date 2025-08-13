import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  Star,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type SidebarProps = {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  // New props for desktop sidebar state management
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
};

export default function Sidebar({ isMobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  // isCollapsed state is now controlled by the parent component (DashboardPage)
  // const [isCollapsed, setIsCollapsed] = useState(false); // Remove this line

  const navItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/promotions", label: "Promotions", icon: Tag },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/account", label: "Account", icon: Users },
  ];

  const bottomNavItems: NavItem[] = [
    { href: "#", label: "Settings", icon: Settings },
  ];

  const toggleDesktopSidebar = () => {
    setIsCollapsed(!isCollapsed); // Use the prop's setter
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        // Mobile view: Add pointer-events-none when closed
        isMobileOpen
          ? "translate-x-0 pointer-events-auto"
          : "-translate-x-full pointer-events-none",
        // Desktop view: Always allow pointer events and adjust top padding
        "md:pointer-events-auto md:translate-x-0 md:top-20 md:h-[calc(100vh-80px)]",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}
    >
      <div className="flex h-16 items-center border-b px-6 md:hidden"> {/* Only show on mobile */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Store Inc.</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close menu</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center rounded-lg p-3 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                  "group"
                )}
              >
                <Icon className="h-5 w-5" />
                <span
                  className={cn(
                    "ml-3 text-sm font-medium",
                    isCollapsed && "md:hidden"
                  )}
                >
                  {label}
                </span>
                {isCollapsed && (
                  <span className="absolute left-full ml-4 -translate-x-3 rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                    {label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-4 border-t border-border"> {/* Separator for bottom items */}
          <ul className="space-y-2">
            {bottomNavItems.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center rounded-lg p-3 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                    "group"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span
                    className={cn(
                      "ml-3 text-sm font-medium",
                      isCollapsed && "md:hidden"
                    )}
                  >
                    {label}
                  </span>
                  {isCollapsed && (
                    <span className="absolute left-full ml-4 -translate-x-3 rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                      {label}
                  </span>
                )}
              </Link>
            </li>
          ))}
          </ul>
        </div>
      </nav>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block">
        <Button
          onClick={toggleDesktopSidebar}
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </aside>
  );
}