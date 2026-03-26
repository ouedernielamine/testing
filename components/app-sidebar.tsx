"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Settings,
  Stethoscope,
  Menu,
  Home,
  GraduationCap,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Cours",
    href: "/cours",
    icon: BookOpen,
  },
  {
    label: "Administration",
    href: "/admin",
    icon: Settings,
  },
];

/* ─── SIDEBAR CONTEXT ─── */
type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

/* ─── SIDEBAR PROVIDER ─── */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
}

/* ─── MOBILE TRIGGER ─── */
export function SidebarMobileTrigger() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <MobileSidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

/* ─── MOBILE SIDEBAR CONTENT ─── */
function MobileSidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-primary/8 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="font-serif text-base font-bold text-primary">
            OncoLearn
          </p>
          <p className="text-[11px] font-medium text-text-muted">
            Faculté de Médecine
          </p>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-text-muted hover:bg-muted-cream hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-primary/8 p-4">
        <div className="flex items-center gap-2.5 rounded-xl bg-muted-cream p-3">
          <GraduationCap className="h-5 w-5 text-accent-gold" />
          <div className="text-xs">
            <p className="font-semibold text-foreground">Oncologie</p>
            <p className="text-text-muted">Gynécologique & Mammaire</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DESKTOP SIDEBAR ─── */
export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-primary/8 bg-surface transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo header */}
      <div
        className={cn(
          "flex items-center border-b border-primary/8 transition-all duration-300",
          collapsed ? "justify-center px-2 py-5" : "gap-2.5 px-5 py-5"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/20">
          <Stethoscope className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-serif text-base font-bold tracking-tight text-primary">
              OncoLearn
            </p>
            <p className="text-[11px] font-medium text-text-muted">
              Faculté de Médecine
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  collapsed
                    ? "h-10 w-10 justify-center"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary/8 text-primary shadow-sm"
                    : "text-text-muted hover:bg-muted-cream hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-sans">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <React.Fragment key={item.href}>{linkContent}</React.Fragment>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="mt-auto border-t border-primary/8 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-gradient-to-br from-muted-cream to-warm-cream p-3">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="h-5 w-5 text-accent-gold" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Oncologie</p>
                <p className="text-text-muted">Gynécologique & Mammaire</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium text-text-muted transition-all hover:bg-muted-cream hover:text-foreground",
                collapsed
                  ? "mx-auto h-10 w-10 justify-center"
                  : "w-full gap-2 px-3 py-2"
              )}
              aria-label={collapsed ? "Développer" : "Réduire"}
            >
              {collapsed ? (
                <PanelLeft className="h-[18px] w-[18px]" />
              ) : (
                <>
                  <PanelLeftClose className="h-[18px] w-[18px]" />
                  <span>Réduire</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="font-sans">
              Développer
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
