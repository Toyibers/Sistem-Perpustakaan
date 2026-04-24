import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Normal Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      // Auto-redirect is handled by useEffect upon AuthContext update

    } catch (err: any) {
      setError(err.message || "Gagal melakukan login. Periksa kembali data Anda.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-emerald-500 stroke-[2.5]" />
          <h2 className="mt-6 text-[1.8rem] font-extrabold text-gray-900 tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-[0.85rem] text-gray-500 font-medium">
            Atau{" "}
            <Link to="/register" className="font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
              daftar akun baru di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[0.85rem] font-bold border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1" htmlFor="email">
                Email / Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 text-[0.95rem] font-medium transition-all bg-gray-50 focus:bg-white"
                placeholder="Masukkan email (atau 'admin')"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[0.85rem] font-semibold text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 text-[0.95rem] font-medium transition-all bg-gray-50 focus:bg-white"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-[0.95rem] font-bold rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none transition-all disabled:opacity-70 shadow-sm active:scale-[0.98]"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
