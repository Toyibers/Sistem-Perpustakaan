import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search, RefreshCw } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { Book, Category } from "../../types";
import { cn } from "../../utils/cn";

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category_id: "",
    description: "",
    cover_url: "",
    stock: 1
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        supabase.from("books").select("*").order("title"),
        supabase.from("categories").select("*").order("name")
      ]);

      if (booksRes.data) setBooks(booksRes.data);
      if (catsRes.data) setCategories(catsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book?: Book) => {
    if (book) {
      setEditingId(book.id);
      setFormData({
        title: book.title,
        author: book.author,
        category_id: book.category_id,
        description: book.description,
        cover_url: book.cover_url || "",
        stock: book.stock
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        author: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        description: "",
        cover_url: "",
        stock: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      
      setFormData({ ...formData, cover_url: data.publicUrl });
    } catch (error: any) {
      console.error("Upload Error (Did you create 'covers' bucket?): ", error.message);
      alert("Gagal upload gambar. Pastikan bucket 'covers' sudah terbuat dan public di Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await supabase.from("books").update(formData).eq("id", editingId);
      } else {
        await supabase.from("books").insert(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan data.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
      try {
        await supabase.from("books").delete().eq("id", id);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Buku</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola data buku dalam perpustakaan</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Buku
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari buku..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.85rem] text-gray-700 border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Cover</th>
                <th className="px-5 py-3 font-semibold">Buku</th>
                <th className="px-5 py-3 font-semibold">Stok</th>
                <th className="px-5 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center"><div className="animate-pulse w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div></td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">Tidak ada data buku yang ditemukan.</td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      {book.cover_url ? (
                        <div className="w-12 h-16 rounded overflow-hidden shadow-sm bg-slate-100">
                           <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-16 rounded bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                           <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 mb-1">{book.title}</div>
                      <div className="text-xs text-slate-500">{book.author} • {categories.find(c => c.id === book.category_id)?.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        book.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      )}>
                        {book.stock} Examplar
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenModal(book)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ring-1 ring-slate-900/5 mt-10 mb-10 sm:my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? "Edit Buku" : "Tambah Buku Baru"}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500 transition-colors p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Judul Buku</label>
                    <input 
                      type="text" required 
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Penulis</label>
                    <input 
                      type="text" required
                      value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <select 
                      required
                      value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                    >
                      <option value="">Pilih Kategori...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stok</label>
                    <input 
                      type="number" min="0" required
                      value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi Lengkap</label>
                  <textarea 
                    rows={4} required
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cover Buku</label>
                  <div className="flex gap-4 items-start">
                    {formData.cover_url ? (
                       <img src={formData.cover_url} alt="Cover Preview" className="h-32 w-24 object-cover rounded shadow-sm border border-slate-200" />
                    ) : (
                       <div className="h-32 w-24 bg-slate-100 flex items-center justify-center rounded border border-slate-200 border-dashed">
                         <ImageIcon className="text-slate-300 w-8 h-8" />
                       </div>
                    )}
                    <div className="flex-1 space-y-4">
                      <div>
                         <p className="text-sm text-slate-500 mb-1">Upload File (Supabase Storage)</p>
                         <label className="flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 transition shadow-sm w-fit">
                           {uploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                           {uploading ? "Mengunggah..." : "Pilih File Gambar"}
                           <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                         </label>
                      </div>
                      <div>
                         <p className="text-sm text-slate-500 mb-1">Atau gunakan URL dari internet</p>
                         <input 
                           type="url" placeholder="https://..."
                           value={formData.cover_url} onChange={(e) => setFormData({...formData, cover_url: e.target.value})}
                           className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500"
                         />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end space-x-3 bg-white sticky bottom-0 rounded-b-2xl pb-2">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={uploading}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Buku"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
