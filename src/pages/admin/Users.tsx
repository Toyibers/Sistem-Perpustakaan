import React, { useState, useEffect, useRef } from "react";
import { User, Search, UserCheck, Eye, X, Camera } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string;
  gender?: string;
  age?: number;
  religion?: string;
  grade_class?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  password_text?: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("name");
      if (data) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (user: UserData) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditing(false);
  };

  const handleCloseDetail = () => {
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          address: editForm.address,
          gender: editForm.gender,
          age: editForm.age,
          religion: editForm.religion,
          grade_class: editForm.grade_class,
          whatsapp_number: editForm.whatsapp_number,
          avatar_url: editForm.avatar_url,
          password_text: editForm.password_text
        })
        .eq('id', selectedUser.id);
        
      if (error) throw error;
      fetchUsers();
      setSelectedUser({ ...selectedUser, ...editForm } as UserData);
      setIsEditing(false);
      alert("Data berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui data user.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Detail & Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {isEditing ? "Edit Profil Pengguna" : "Detail Profil Pengguna"}
              </h3>
              <button onClick={handleCloseDetail} className="p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Avatar Section */}
              <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100 mb-6">
                <div 
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={`relative h-24 w-24 rounded-full border-2 border-dashed ${isEditing ? 'border-gray-300 hover:border-emerald-500 cursor-pointer' : 'border-transparent'} flex items-center justify-center overflow-hidden transition-colors bg-gray-50`}
                >
                  {editForm.avatar_url ? (
                    <img src={editForm.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400 flex flex-col items-center">
                      <Camera className="h-8 w-8 text-gray-300 mb-1" />
                      <span className="text-[0.6rem] font-semibold uppercase tracking-wider">No Foto</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                {isEditing && <p className="text-[0.7rem] text-gray-400 mt-2">Klik untuk mengubah foto</p>}
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.name || "-"}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email (Bawaan Auth)</label>
                  <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.email || "-"}</div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Alamat Lengkap</label>
                  {isEditing ? (
                    <textarea className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" rows={2} value={editForm.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})}></textarea>
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.address || "-"}</div>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Jenis Kelamin</label>
                  {isEditing ? (
                    <select className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.gender || ""} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                      <option value="">Pilih</option><option value="Laki-Laki">Laki-Laki</option><option value="Perempuan">Perempuan</option>
                    </select>
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.gender || "-"}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Usia</label>
                  {isEditing ? (
                    <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.age || ""} onChange={e => setEditForm({...editForm, age: parseInt(e.target.value)})} />
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.age || "-"}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Agama</label>
                  {isEditing ? (
                    <select className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.religion || ""} onChange={e => setEditForm({...editForm, religion: e.target.value})}>
                      <option value="">Pilih</option><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option>
                    </select>
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.religion || "-"}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Kelas</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.grade_class || ""} onChange={e => setEditForm({...editForm, grade_class: e.target.value})} />
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.grade_class || "-"}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nomor WhatsApp</label>
                  {isEditing ? (
                    <input type="tel" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.whatsapp_number || ""} onChange={e => setEditForm({...editForm, whatsapp_number: e.target.value})} />
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.whatsapp_number || "-"}</div>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Password (Status Read-only/Plain Text Demo)</label>
                  {isEditing ? (
                    <input type="text" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" value={editForm.password_text || ""} onChange={e => setEditForm({...editForm, password_text: e.target.value})} />
                  ) : <div className="text-[0.95rem] font-medium text-gray-900 pb-2 border-b border-gray-100">{selectedUser.password_text || "Terkripsi"}</div>}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              {isEditing ? (
                <>
                   <button onClick={() => setIsEditing(false)} className="px-4 py-2 font-semibold text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
                   <button onClick={handleSaveEdit} disabled={isSaving} className="px-4 py-2 font-semibold text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 font-semibold text-sm text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors">Edit Profil</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-slate-800">Manajemen User</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar anggota perpustakaan dan administrator</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
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
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-center w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center"><div className="animate-pulse w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div></td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">Tidak ada user ditemukan.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold mr-3 border border-emerald-100 overflow-hidden">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{u.name}</span>
                    </td>
                    <td className="px-5 py-3">{u.email}</td>
                    <td className="px-5 py-3">
                      {u.role === 'admin' ? (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                           <UserCheck className="w-3 h-3 mr-1" />
                           Admin
                         </span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                           Siswa/Guru
                         </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                       <button onClick={() => handleOpenDetail(u)} className="inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-colors w-full cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
