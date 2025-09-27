"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/research", label: "新任务" },
    { href: "/research/history", label: "历史任务" },
    { href: "/research/settings", label: "设置" },
  ];

  return (
    <section className="flex min-h-screen bg-slate-50">
      <aside className="w-64 border-r bg-white p-4 shadow-xl border-slate-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            研究中心
          </h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start text-base font-medium transition-all duration-200 rounded-lg",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {children}
        </main>
    </section>
  );
}
