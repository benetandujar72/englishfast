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
  Languages,
  Menu,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/diary", label: "Diary", icon: BookOpen },
  { href: "/exam", label: "Exam", icon: GraduationCap },
  { href: "/speaking", label: "Speaking", icon: Mic2 },
  { href: "/entreno", label: "Entreno", icon: Languages },
  { href: "/vocabulary", label: "Vocabulary", icon: BookText },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-base text-white shadow-md">
          🎓
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">English First</h1>
          <p className="text-xs text-muted-foreground/90">AI Tutor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl border border-transparent transition-all",
                  isActive &&
                    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/40 p-2 backdrop-blur-sm dark:bg-slate-900/40">
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
    <div className="flex h-screen bg-transparent">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-950/70 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile header + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-2 border-b border-white/10 bg-white/70 px-4 py-3 backdrop-blur-lg dark:bg-slate-950/70 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <Sidebar className="bg-white/90 backdrop-blur-xl dark:bg-slate-950/90" />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold tracking-tight">🎓 English First</span>
        </header>

        <main className="flex-1 overflow-auto p-1 md:p-2">{children}</main>
      </div>
    </div>
  );
}
