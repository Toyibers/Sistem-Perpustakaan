import { useState, useEffect } from "react";
import { Book, Users, RefreshCw, TrendingUp } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../utils/cn";

export default function Dashboard() {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    activeBorrowings: 0,
    totalBorrowings: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [booksRes, usersRes, activeBorRes, totalBorRes, recentActivitiesRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }).eq('role', 'user'),
        supabase.from("borrowings").select("id", { count: "exact", head: true }).eq("status", "borrowed"),
        supabase.from("borrowings").select("id", { count: "exact", head: true }),
        supabase.from("borrowings").select(`
          id, borrow_date, return_date, status,
          books (id, title),
          users (id, name, email)
        `).order("borrow_date", { ascending: false }).limit(5)
      ]);

      setStats({
        books: booksRes.count || 0,
        users: usersRes.count || 0,
        activeBorrowings: activeBorRes.count || 0,
        totalBorrowings: totalBorRes.count || 0,
      });

      if (recentActivitiesRes.data) {
        setRecentActivities(recentActivitiesRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Total Buku", value: stats.books, icon: Book, color: "bg-blue-500", light: "bg-blue-50 text-blue-600" },
    { label: "Buku Dipinjam", value: stats.activeBorrowings, icon: RefreshCw, color: "bg-amber-500", light: "bg-amber-50 text-amber-600" },
    { label: "Total Siswa / User", value: stats.users, icon: Users, color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-600" },
    { label: "Total Transaksi", value: stats.totalBorrowings, icon: TrendingUp, color: "bg-purple-500", light: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-[1.35rem] font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.slice(0, 3).map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                {loading ? (
                   <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                ) : (
                  <div className="text-2xl font-bold font-sans tracking-tight text-gray-900">{card.value}</div>
                )}
                <div className="text-[0.85rem] text-gray-500">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div>
         <div className="flex items-center justify-between mb-5">
           <h2 className="text-[1.1rem] font-bold text-gray-800">Aktivitas Terbaru</h2>
           <span className="text-[0.85rem] text-emerald-500 cursor-pointer font-medium hover:underline">Lihat Semua {"\u2192"}</span>
         </div>
         
         <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="space-y-4 p-5">
                 {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>)}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium text-sm">Belum ada aktivitas terbaru</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[0.85rem]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-5 py-3 font-semibold text-gray-700">Peminjam</th>
                      <th className="px-5 py-3 font-semibold text-gray-700">Judul Buku</th>
                      <th className="px-5 py-3 font-semibold text-gray-700 whitespace-nowrap">Tanggal Pinjam</th>
                      <th className="px-5 py-3 font-semibold text-gray-700 whitespace-nowrap">Tenggat Waktu</th>
                      <th className="px-5 py-3 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-bold text-gray-800">{activity.users?.name || "Unknown User"}</div>
                          <div className="text-[0.75rem] text-gray-500">{activity.users?.email}</div>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-800">{activity.books?.title || "Unknown Book"}</td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {activity.borrow_date ? format(new Date(activity.borrow_date), "dd MMM yyyy", { locale: id }) : "-"}
                        </td>
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {activity.return_date ? format(new Date(activity.return_date), "dd MMM yyyy", { locale: id }) : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md font-semibold text-[0.75rem]",
                            activity.status === "borrowed" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          )}>
                            {activity.status === "borrowed" ? "Meminjam" : "Mengembalikan"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
