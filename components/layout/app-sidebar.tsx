"use client";

import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  UploadCloud,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/documents", label: "Documents", icon: FolderKanban },
  { href: "/admin/documents/upload", label: "Upload", icon: UploadCloud },
  { href: "/admin/product-categories", label: "Product Categories", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: UploadCloud },
];

// Employees get the internal-docs chat plus their own account pages.
const staffNavItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Customers get the same chat (it already answers order/product/profile
// questions) plus dedicated shop/cart/order/ticket pages for anything
// easier to do with a form than a sentence.
const customerNavItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/tickets", label: "Support Tickets", icon: Ticket },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  const mainNavItems = user?.role === "customer" ? customerNavItems : staffNavItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <MessageSquare className="size-5 shrink-0" />
          <span className="truncate font-semibold">Knowledge Base</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isLoading ? (
          // Role not known yet — don't flash another role's nav items.
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu aria-busy="true">
                {[0, 1, 2].map((index) => (
                  <SidebarMenuItem key={index}>
                    <div className="flex h-8 items-center gap-2 px-2">
                      <Skeleton className="size-4 rounded-md" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>{user?.role === "customer" ? "Shop" : "General"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log out" onClick={() => logout()}>
              <LogOut />
              <span>{user?.email ?? "Log out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
