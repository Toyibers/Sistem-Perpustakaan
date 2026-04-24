import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Book, Users, BookOpenCheck, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

export default function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Manajemen Buku", icon: Book, path: "/admin/books" },
    { label: "Data Peminjaman", icon: BookOpenCheck, path: "/admin/borrowings" },
    { label: "Manajemen User", icon: Users, path: "/admin/users" },
    { label: "Profile Admin", icon: Users, path: "/admin/profile" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-10 transition-transform transform md:translate-x-0 hidden md:flex py-6">
        <div className="px-6 pb-8 flex items-center gap-2.5 text-emerald-500 font-extrabold text-xl">
          <Book className="h-6 w-6 stroke-[2.5]" />
          <span>LibSchool</span>
        </div>
        
        <nav className="flex-1 flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-6 py-3 flex items-center gap-3 text-[0.95rem] font-medium transition-all duration-200",
                  isActive 
                    ? "bg-emerald-50 text-emerald-500 border-r-4 border-emerald-500" 
                    : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-500"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-emerald-500" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="px-6 pt-6 mt-auto border-t border-gray-200">
          <p className="text-[0.75rem] text-gray-500 mb-3 uppercase font-medium">Administrasi</p>
          <div className="flex items-center mb-4 gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0 ring-2 ring-emerald-100">
              {(user as any).avatar_url ? (
                <img src={(user as any).avatar_url} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-[0.85rem] font-bold text-gray-800 truncate" title={user.name}>{user.name}</p>
              <div className="inline-flex bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold mt-0.5 whitespace-nowrap">System Admin</div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center py-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center md:hidden">
             {/* Mobile menu button would go here */}
             <span className="font-bold text-lg text-emerald-500">LibSchool</span>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800 capitalize">
              {location.pathname === '/admin' ? 'Dashboard Overview' : location.pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
            <Link to="/" className="flex items-center text-[0.85rem] font-medium text-gray-500 hover:text-emerald-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Kembali ke Web
            </Link>
          </div>
        </header>
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
