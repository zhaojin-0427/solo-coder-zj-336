import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutGrid,
  Archive,
  PenLine,
  Image,
  MessageSquareText,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "首页", icon: LayoutGrid, end: true },
  { to: "/archive", label: "器具档案", icon: Archive },
  { to: "/records", label: "练习记录", icon: PenLine },
  { to: "/pattern-review", label: "纹样复盘", icon: Image },
  { to: "/review", label: "点评反馈", icon: MessageSquareText },
  { to: "/experience", label: "经验沉淀", icon: Lightbulb },
  { to: "/stats", label: "统计", icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-ink-800 text-paper-light shadow-ink-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-gold flex items-center justify-center">
                <span className="font-serif text-gold text-lg leading-none">茶</span>
              </div>
              <div>
                <h1 className="font-serif text-lg font-semibold leading-tight">宋式点茶</h1>
                <p className="text-[10px] text-paper-light/50 tracking-widest leading-none mt-0.5">
                  茶百戏纹样复现平台
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-paper-light/10 text-gold"
                          : "text-paper-light/70 hover:text-paper-light hover:bg-paper-light/5"
                      )
                    }
                  >
                    <Icon size={15} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-paper-light/10 text-gold"
                        : "text-paper-light/70 hover:text-paper-light"
                    )
                  }
                >
                  <Icon size={13} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200/50 py-5 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-ink-400">
          <span className="font-serif">器具建档 → 点茶记录 → 纹样复盘 → 点评沉淀</span>
          <span>前端 :9551 · 后端 :9552</span>
        </div>
      </footer>
    </div>
  );
}
