import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Archive, Compass, GitBranch, Map, BookOpen, Wand2,
  Sparkles, Search, LogIn, LogOut, Menu, X, ChevronRight,
  User, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const NAV_ITEMS = [
  { path: "/archive", label: "Archive", icon: Archive, description: "All 174 tracks" },
  { path: "/explore", label: "Explore", icon: Compass, description: "Visual discovery" },
  { path: "/graph", label: "Knowledge Graph", icon: GitBranch, description: "Connections" },
  { path: "/districts", label: "Districts", icon: Map, description: "Four zones" },
  { path: "/symbols", label: "Symbolism", icon: BookOpen, description: "Visual language" },
  { path: "/mythology", label: "Mythology Engine", icon: Sparkles, description: "AI insights" },
  { path: "/create", label: "Create Mode", icon: Wand2, description: "Expand universe" },
  { path: "/search", label: "Search", icon: Search, description: "Find anything" },
  { path: "/export", label: "Export & Docs", icon: Download, description: "Generate documents" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); toast.success("Signed out"); }
  });

  return (
    <div className="flex min-h-screen bg-[#050510]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 flex flex-col
        border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ background: "linear-gradient(180deg, #06040f 0%, #050510 100%)" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-teal"
              style={{ background: "linear-gradient(135deg, #00d4ff22, #7c3aed22)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <span className="text-[#00d4ff] font-display font-bold text-sm">C</span>
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm tracking-wide">CUOS</div>
              <div className="text-[10px] text-white/30 tracking-widest uppercase">City Cycle</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white/80">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || location.startsWith(item.path + "/");
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                    transition-all duration-200 group
                    ${isActive
                      ? "bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff]"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                    }
                  `} onClick={() => setSidebarOpen(false)}>
                    <Icon size={16} className={isActive ? "text-[#00d4ff]" : "text-white/40 group-hover:text-white/60"} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isActive ? "text-[#00d4ff]" : ""}`}>{item.label}</div>
                      <div className="text-[10px] text-white/25 truncate">{item.description}</div>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-[#00d4ff]/60" />}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Universe tagline */}
          <div className="mt-6 mx-2 p-3 rounded-lg" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <p className="text-[10px] text-white/40 italic leading-relaxed">
              "The city never sleeps because someone somewhere is always performing."
            </p>
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.06]">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-[#7c3aed]/30 text-[#c084fc] text-xs">
                  {user.name?.charAt(0) ?? <User size={12} />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 truncate">{user.name ?? "Creator"}</div>
                <div className="text-[10px] text-white/30">Collaborator</div>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                className="text-white/30 hover:text-white/60 transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/[0.06] transition-all text-sm">
              <LogIn size={14} />
              <span>Sign in to collaborate</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
          style={{ background: "#06040f" }}>
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white text-sm tracking-wide">CUOS</span>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
