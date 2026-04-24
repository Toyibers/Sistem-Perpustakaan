import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Camera } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [religion, setReligion] = useState("");
  const [gradeClass, setGradeClass] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran gambar maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    if (!gender || !religion) {
      setError("Mohon lengkapi pilihan Jenis Kelamin dan Agama.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Add to users table
        const { error: dbError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            name,
            email,
            role: "user", // Default role
            address,
            gender,
            age: parseInt(age),
            religion,
            grade_class: gradeClass,
            whatsapp_number: whatsappNumber,
            avatar_url: avatarBase64,
            password_text: password // Menyimpan text base password untuk keperluan demo CRUD sesuai permintaan
          });
          
        if (dbError) {
          console.error("Database insert error details:", dbError);
          // throw dbError;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Gagal melakukan pendaftaran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6 border border-emerald-100">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
           </div>
           <h2 className="text-[1.5rem] font-bold text-gray-900 mb-2 tracking-tight">Pendaftaran Berhasil!</h2>
           <p className="text-[0.9rem] text-gray-500 font-medium">Anda akan diarahkan ke halaman login dalam beberapa detik.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 my-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-emerald-500 stroke-[2.5]" />
          <h2 className="mt-6 text-[1.8rem] font-extrabold text-gray-900 tracking-tight">
            Pendaftaran Pengguna Baru
          </h2>
          <p className="mt-2 text-[0.85rem] text-gray-500 font-medium">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[0.85rem] font-bold border border-red-200">
              {error}
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center justify-center pb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative h-24 w-24 rounded-full border-2 border-dashed border-gray-300 hover:border-emerald-500 flex items-center justify-center cursor-pointer overflow-hidden transition-colors bg-gray-50"
            >
              {avatarBase64 ? (
                <img src={avatarBase64} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-gray-400 flex flex-col items-center">
                  <Camera className="h-8 w-8 text-gray-300 mb-1" />
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wider">Foto Profil</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange}
            />
            <p className="text-[0.7rem] text-gray-400 mt-2">Format: JPG, PNG. Maks 2MB.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
              <select required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Pilih Gender</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Usia (Tahun)</label>
              <input type="number" required min="1" className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Agama</label>
              <select required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={religion} onChange={e => setReligion(e.target.value)}>
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Nomor WhatsApp</label>
              <input type="tel" required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" placeholder="Contoh: 08123456789" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Kelas (Opsional / Jika Siswa)</label>
              <input type="text" className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" placeholder="Contoh: IX" value={gradeClass} onChange={e => setGradeClass(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea required rows={2} className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" value={address} onChange={e => setAddress(e.target.value)}></textarea>
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1">Ulangi Password</label>
              <input type="password" required className="block w-full px-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-[0.95rem] bg-gray-50 focus:bg-white transition-all" placeholder="Ketikan ulang password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-[0.95rem] font-bold rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none transition-all disabled:opacity-70 shadow-sm active:scale-[0.98]"
            >
              {loading ? "Memproses..." : "Daftar Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
