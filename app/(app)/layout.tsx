"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  GraduationCap,
  BookText,
  Mic2,
  Menu,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/diary", label: "Diary", icon: BookOpen },
  { href: "/exam", label: "Exam", icon: GraduationCap },
  { href: "/speaking", label: "Speaking", icon: Mic2 },
  { href: "/vocabulary", label: "Vocabulary", icon: BookText },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Logo */}
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <span className="text-2xl">🎓</span>
        <div>
          <h1 className="text-sm font-bold">English First</h1>
          <p className="text-xs text-muted-foreground">AI Tutor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback>
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">
              {session?.user?.name ?? "User"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-card lg:block">
        <Sidebar />
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-2 border-b px-4 py-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-bold">🎓 English First</span>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
