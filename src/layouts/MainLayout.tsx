import { Link, Outlet, useLocation } from "react-router-dom";
import { BookOpen, LogOut, User as UserIcon, History } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function MainLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center px-8">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
            <Link to="/" className="flex items-center gap-2.5 text-emerald-500 font-extrabold text-xl">
              <BookOpen className="h-6 w-6 stroke-[2.5]" />
              <span>LibSchool</span>
            </Link>
            
            <div className="flex items-center gap-8">
              <Link 
                to="/" 
                className={`text-[0.95rem] font-medium transition-colors ${location.pathname === '/' ? 'text-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
              >
                Katalog Buku
              </Link>
              {user && user.role !== 'admin' && (
                <Link 
                  to="/history" 
                  className={`flex items-center gap-2 text-[0.95rem] font-medium transition-colors ${location.pathname === '/history' ? 'text-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
                >
                  <History className="h-4 w-4" />
                  <span>Riwayat</span>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-[0.85rem] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  Dashboard Admin
                </Link>
              )}
              
              {user ? (
                 <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                   <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
                     <div className="text-right hidden sm:block group-hover:text-emerald-500 transition-colors">
                       <div className="font-semibold text-[0.85rem] text-gray-800 group-hover:text-emerald-500">{user.name}</div>
                       <div className="text-[0.7rem] text-gray-500 font-medium capitalize">{user.role}</div>
                     </div>
                     <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm ring-2 ring-transparent group-hover:ring-emerald-200 transition-all overflow-hidden">
                       {(user as any).avatar_url ? (
                         <img src={(user as any).avatar_url} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         user.name.charAt(0).toUpperCase()
                       )}
                     </div>
                   </Link>
                   <button 
                     onClick={handleSignOut}
                     className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                     title="Logout"
                   >
                     <LogOut className="h-4 w-4" />
                   </button>
                 </div>
              ) : (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <Link to="/login" className="text-[0.85rem] font-semibold text-gray-500 hover:text-emerald-500 transition-colors">Masuk</Link>
                  <Link to="/register" className="text-[0.85rem] font-semibold text-white bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all">Daftar</Link>
                </div>
              )}
            </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Sistem Perpustakaan Digital Sekolah. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
