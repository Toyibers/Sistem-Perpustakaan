import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { format, isPast } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../utils/cn";

interface HistoryItem {
  id: string;
  borrow_date: string;
  return_date: string;
  status: "borrowed" | "returned";
  book: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
  };
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('borrowings')
        .select(`
          id,
          borrow_date,
          return_date,
          status,
          books:book_id (id, title, author, cover_url)
        `)
        .eq('user_id', user.id)
        .order('borrow_date', { ascending: false });

      if (data && !error) {
        // Map data to match interface
        const formatted = data.map((item: any) => ({
          ...item,
          book: item.books
        }));
        setHistory(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeBorrowings = history.filter(h => h.status === 'borrowed');
  const pastBorrowings = history.filter(h => h.status === 'returned');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-[1.35rem] font-bold text-gray-800">Riwayat Peminjaman</h1>
        <p className="text-[0.85rem] text-gray-500">Pantau koleksi buku yang saat ini Anda pinjam atau pernah Anda abaca.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => (
             <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 flex items-center">
               <div className="w-16 h-24 bg-slate-200 rounded mr-4"></div>
               <div className="flex-1 space-y-3">
                 <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                 <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                 <div className="h-8 bg-slate-200 rounded w-1/5 mt-4"></div>
               </div>
             </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-[1.1rem] font-bold text-gray-800 mb-2">Belum ada riwayat peminjaman</h3>
          <p className="text-[0.85rem] text-gray-500 mb-6">Mulai eksplorasi katalog kami dan pinjam buku favoritmu.</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-[0.85rem] font-semibold rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition"
          >
            Lihat Katalog
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeBorrowings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[1.1rem] font-bold text-gray-800 flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-emerald-500" />
                Sedang Dipinjam
              </h2>
              <div className="grid gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                 {activeBorrowings.map(item => {
                   const isLate = isPast(new Date(item.return_date));
                   
                   return (
                     <div key={item.id} className="bg-white p-4 rounded-xl shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-emerald-500 transition-all group">
                       <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
                         {item.book?.cover_url ? (
                           <img src={item.book.cover_url} alt={item.book.title} className="w-full h-full object-cover" />
                         ) : (
                           <BookOpen className="h-8 w-8 text-gray-300" />
                         )}
                       </div>
                       
                       <div className="flex-1">
                         <Link to={`/books/${item.book?.id}`} className="text-[0.95rem] font-bold text-gray-800 hover:text-emerald-500 transition-colors line-clamp-1">
                           {item.book?.title}
                         </Link>
                         <p className="text-[0.8rem] text-gray-500 mb-2">{item.book?.author}</p>
                         <div className="flex flex-wrap gap-2 mt-2">
                           <div className="inline-flex items-center text-[0.7rem] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                             <Calendar className="w-3 h-3 mr-1" />
                             Pinjam: {format(new Date(item.borrow_date), "dd MMM yy", { locale: id })}
                           </div>
                           <div className={cn(
                             "inline-flex items-center text-[0.7rem] font-semibold px-2 py-1 rounded-md border",
                             isLate ? "text-red-600 bg-red-50 border-red-200" : "text-emerald-600 bg-emerald-50 border-emerald-200"
                           )}>
                             <Calendar className="w-3 h-3 mr-1" />
                             Tenggat: {format(new Date(item.return_date), "dd MMM yy", { locale: id })}
                           </div>
                         </div>
                       </div>
                       
                       <div className="shrink-0 mt-4 sm:mt-0 text-right">
                         {isLate && (
                           <div className="flex items-center text-red-500 text-[0.8rem] font-bold mb-2 sm:justify-end">
                             <AlertCircle className="w-4 h-4 mr-1 stroke-[2.5]" /> Terlambat
                           </div>
                         )}
                         <Link to={`/books/${item.book?.id}`} className="inline-flex items-center text-[0.8rem] font-bold text-emerald-500 hover:text-emerald-600">
                           Detail <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                         </Link>
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          )}

          {pastBorrowings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-[1.1rem] font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-gray-600" />
                Selesai Dikembalikan
              </h2>
              <div className="grid gap-4">
                {pastBorrowings.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)]">
                     <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                       {item.book?.cover_url && (
                         <img src={item.book.cover_url} alt="" className="w-full h-full object-cover" />
                       )}
                     </div>
                     <div className="flex-1">
                       <h3 className="text-[0.9rem] font-bold text-gray-800">{item.book?.title}</h3>
                       <p className="text-[0.75rem] text-gray-500">Dikembalikan: {format(new Date(item.return_date), "dd MMM yyyy", { locale: id })}</p>
                     </div>
                     <span className="text-[0.75rem] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Selesai</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
