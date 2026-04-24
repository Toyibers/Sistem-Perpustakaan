import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, BookOpen } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { Book, Category } from "../../types";
import { cn } from "../../utils/cn";

export default function Catalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        supabase.from("books").select("*"),
        supabase.from("categories").select("*")
      ]);

      if (booksRes.data) {
        setBooks(booksRes.data);
      }

      if (catsRes.data) {
        setCategories(catsRes.data);
      }
    } catch (error) {
      console.error("Error fetching catalog", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? book.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[1.1rem] font-bold text-gray-800">Katalog Populer</h2>
        <span className="text-[0.85rem] text-emerald-500 cursor-pointer font-medium hover:underline">Lihat Semua {"\u2192"}</span>
      </div>
      
      <div className="mb-6 flex gap-4 max-w-2xl">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari judul buku atau penulis..."
            className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg text-[0.85rem] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-48 pl-4 pr-8 py-2 border border-gray-200 rounded-lg text-[0.85rem] bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-gray-700 cursor-pointer appearance-none"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-200 overflow-hidden h-72">
                <div className="bg-gray-200 h-[140px] w-full"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition-all cursor-pointer flex flex-col group">
                <div className="relative h-[140px] bg-gray-200 flex items-center justify-center overflow-hidden">
                  {book.cover_url ? (
                    <img 
                      src={book.cover_url} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                      <BookOpen className="w-10 h-10 opacity-50" />
                    </div>
                  )}
                  <span className="absolute top-2.5 right-2.5 bg-emerald-500/90 text-white px-2 py-1 rounded-md text-[0.7rem] font-semibold backdrop-blur-sm shadow-sm leading-none">
                    {categories.find(c => c.id === book.category_id)?.name || "Lainnya"}
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-[0.9rem] font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[0.75rem] text-gray-500 mb-2">{book.author}</p>
                  
                  <div className="text-[0.7rem] mb-3 mt-auto">
                    Stok: <span className={cn("font-bold", book.stock > 0 ? "text-emerald-500" : "text-red-500")}>
                      {book.stock > 0 ? `${book.stock} Tersedia` : "Kosong"}
                    </span>
                  </div>
                  <Link 
                    to={`/books/${book.id}`}
                    className={cn(
                      "w-full text-center py-2 rounded-lg text-[0.8rem] font-semibold transition-colors block",
                      book.stock > 0 
                       ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                       : "bg-gray-200 text-gray-500 pointer-events-none"
                    )}
                  >
                    {book.stock > 0 ? "Baca / Detail" : "Tidak Tersedia"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Tidak ada buku ditemukan</h3>
            <p className="text-slate-500">Coba ubah kata kunci atau filter kategori</p>
          </div>
        )}
    </div>
  );
}
