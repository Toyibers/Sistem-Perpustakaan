import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Save } from "lucide-react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    gender: "",
    age: "",
    religion: "",
    grade_class: "",
    whatsapp_number: "",
    avatar_url: "",
    password_text: ""
  });

  useEffect(() => {
    if (user?.id) {
      fetchAdminProfile();
    }
  }, [user]);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          gender: data.gender || "",
          age: data.age?.toString() || "",
          religion: data.religion || "",
          grade_class: data.grade_class || "",
          whatsapp_number: data.whatsapp_number || "",
          avatar_url: data.avatar_url || "",
          password_text: data.password_text || ""
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat profil admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          address: formData.address,
          gender: formData.gender,
          age: formData.age ? parseInt(formData.age) : null,
          religion: formData.religion,
          grade_class: formData.grade_class,
          whatsapp_number: formData.whatsapp_number,
          avatar_url: formData.avatar_url,
          password_text: formData.password_text
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setSuccessMsg("Profil berhasil diperbarui!");
      refreshUser(); // Refresh Global Auth state if needed
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Gagal menyimpan perubahan profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Profile Admin</h2>
        <p className="text-sm text-slate-500 mt-1">Kelola informasi data profil administratif Anda</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSave} className="p-6 md:p-8">
          
          {successMsg && (
            <div className="mb-6 bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-semibold border border-emerald-200">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Avatar Area */}
          <div className="flex flex-col items-center justify-center pb-8 border-b border-gray-100 mb-8">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="relative h-28 w-28 rounded-full border-2 border-dashed border-gray-300 hover:border-emerald-500 flex items-center justify-center overflow-hidden transition-colors bg-gray-50 cursor-pointer shadow-sm group"
             >
               {formData.avatar_url ? (
                 <img src={formData.avatar_url} alt="Admin Profile" className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
               ) : (
                 <div className="text-center text-gray-400 flex flex-col items-center">
                   <User className="h-10 w-10 text-gray-300 mb-1" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-[0.6rem] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
               </div>
             </div>
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
             <h3 className="mt-4 text-xl font-bold text-gray-800">{formData.name || 'Admin'}</h3>
             <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mt-1 border border-emerald-100">Super Admin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
              <input type="text" name="name" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Read-only)</label>
              <input type="email" name="email" readOnly disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed text-[0.95rem]" value={formData.email} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
              <textarea name="address" required rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.address} onChange={handleChange}></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jenis Kelamin</label>
              <select name="gender" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.gender} onChange={handleChange}>
                <option value="">Pilih</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usia (Tahun)</label>
              <input type="number" name="age" required min="1" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.age} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Agama</label>
              <select name="religion" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.religion} onChange={handleChange}>
                <option value="">Pilih</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelas</label>
              <input type="text" name="grade_class" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.grade_class} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor WhatsApp</label>
              <input type="tel" name="whatsapp_number" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.whatsapp_number} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Text (Demo Use)</label>
              <input type="text" name="password_text" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white text-[0.95rem] transition-all" value={formData.password_text} onChange={handleChange} />
              <p className="text-[0.75rem] text-gray-500 mt-1">* Menampilkan password secara langsung untuk keperluan demo admin CRUD profil.</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end pb-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-3 font-bold text-sm text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
