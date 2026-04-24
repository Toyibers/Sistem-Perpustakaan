import { useState, useEffect } from "react";
import { CheckCircle, Search, Clock } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { format, isPast } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../utils/cn";
import CountdownTimer from "../../components/CountdownTimer";

interface BorrowData {
  id: string;
  borrow_date: string;
  return_date: string;
  returned_at?: string; // Menambahkan kolom rekam waktu pengembalian
  status: "borrowed" | "returned";
  books: { id: string; title: string; stock: number };
  users: { id: string; name: string; email: string };
}

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState<BorrowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'borrowed', 'returned'
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, borrowId: string, bookId: string, stock: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = async () => {
    try {
      // First try with returned_at
      let { data, error } = await supabase
        .from("borrowings")
        .select(`
          id, borrow_date, return_date, returned_at, status,
          books (id, title, stock),
          users (id, name, email)
        `)
        .order("borrow_date", { ascending: false });

      // If it fails due to column not existing, fallback without it
      if (error && error.code === '42703') {
        const fallback = await supabase
          .from("borrowings")
          .select(`
            id, borrow_date, return_date, status,
            books (id, title, stock),
            users (id, name, email)
          `)
          .order("borrow_date", { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (data) setBorrowings(data as any);
      if (error) console.error("Error fetching borrowings:", error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnClick = (borrowId: string, bookId: string, currentStock: number) => {
    setConfirmDialog({ isOpen: true, borrowId, bookId, stock: currentStock });
  };

  const processReturn = async () => {
    if (!confirmDialog) return;
    setIsProcessing(true);
    try {
      const returnedAtTime = new Date().toISOString();
      // Optimistically update UI so the button changes instantly
      setBorrowings(prev => prev.map(b => 
        b.id === confirmDialog.borrowId ? { ...b, status: 'returned', returned_at: returnedAtTime } : b
      ));

      // 1. Update status
      let { error: updateError } = await supabase.from("borrowings").update({ status: "returned", returned_at: returnedAtTime }).eq("id", confirmDialog.borrowId);
      
      if (updateError && updateError.code === '42703') {
        const fallback = await supabase.from("borrowings").update({ status: "returned" }).eq("id", confirmDialog.borrowId);
        updateError = fallback.error;
      }

      if (updateError) throw updateError;
      
      // 2. Increment stock
      const { error: stockError } = await supabase.from("books").update({ stock: confirmDialog.stock + 1 }).eq("id", confirmDialog.bookId);
      if (stockError) throw stockError;
      
      // Final refresh from server to ensure sync
      fetchBorrowings();
    } catch (error) {
      console.error(error);
      alert("Gagal mengupdate status peminjaman.");
      fetchBorrowings(); // Revert back if error
    } finally {
      setIsProcessing(false);
      setConfirmDialog(null);
    }
  };

  const filtered = borrowings.filter(b => {
    const s = search.toLowerCase();
    const matchSearch = b.books?.title.toLowerCase().includes(s) || b.users?.name.toLowerCase().includes(s);
    const matchFilter = filter === 'all' ? true : b.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 relative">
      {/* Modal Konfirmasi Pengembalian */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200 relative">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Konfirmasi Setuju</h3>
            <p className="text-gray-500 text-[0.9rem] mb-6 text-center leading-relaxed">
              Apakah Anda yakin Menyetujuinya ?
            </p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Tidak
              </button>
              <button
                onClick={processReturn}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? "Menyimpan..." : "Iya"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-800">Data Peminjaman</h2>
        <p className="text-sm text-slate-500 mt-1">Kelola transaksi peminjaman dan pengembalian buku</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari buku atau peminjam..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
             <button
               onClick={() => setFilter('all')}
               className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border", filter === 'all' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
             >
               Semua
             </button>
             <button
               onClick={() => setFilter('borrowed')}
               className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border", filter === 'borrowed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
             >
               Dipinjam
             </button>
             <button
               onClick={() => setFilter('returned')}
               className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border", filter === 'returned' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
             >
               Selesai
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem] text-gray-700 border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Peminjam</th>
                <th className="px-5 py-3 font-semibold">Buku</th>
                <th className="px-5 py-3 font-semibold">Tanggal Pinjam</th>
                <th className="px-5 py-3 font-semibold">Tenggat Waktu</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Waktu Tersisa</th>
                <th className="px-5 py-3 font-semibold text-center w-[150px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500"><div className="animate-pulse w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">Tidak ada data transaksi.</td></tr>
              ) : (
                filtered.map((item) => {
                  const isLate = item.status === 'borrowed' && isPast(new Date(item.return_date));
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">{item.users?.name || "Unknown User"}</div>
                        <div className="text-xs text-slate-500">{item.users?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.books?.title || "Unknown Book"}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {item.borrow_date ? format(new Date(item.borrow_date), "dd MMM yyyy", { locale: id }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                         <span className={cn("font-medium", isLate ? "text-red-600" : "text-slate-600")}>
                           {item.return_date ? format(new Date(item.return_date), "dd MMM yyyy", { locale: id }) : "-"}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === 'borrowed' ? (
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                            isLate ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>
                            <Clock className="w-3 h-3 mr-1" />
                            {isLate ? "Terlambat" : "Dipinjam"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Terekam Selesai
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 border-l border-gray-100 bg-gray-50/30 text-center">
                        {item.status === 'borrowed' ? (
                          <CountdownTimer targetDate={item.return_date} className="text-[0.85rem]" />
                        ) : (
                          <CountdownTimer targetDate={item.return_date} className="text-[0.8rem]" isFrozen={true} frozenAtDate={item.returned_at} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'borrowed' ? (
                          <button 
                            onClick={() => handleReturnClick(item.id, item.books.id, item.books.stock)}
                            className="inline-flex justify-center items-center text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm w-full cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Kembalikan
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="inline-flex justify-center items-center text-xs font-bold bg-gray-100 text-gray-400 border border-transparent px-3 py-2 rounded-lg cursor-not-allowed w-full"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Dikembalikan
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
