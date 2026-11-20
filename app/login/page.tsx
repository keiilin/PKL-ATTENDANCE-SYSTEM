"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "SISWA") {
        router.push("/dashboard");
      } else if (data.user.role === "PEMBIMBING") {
        router.push("/pembimbing/dashboard");
      } else if (data.user.role === "KETUA_JURUSAN") {
        router.push("/ketua-jurusan/dashboard");
      }
    } catch {
      setMessage("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white">

        <div className="grid md:grid-cols-2">

          {/* ================= LEFT ================= */}
          <section className="hidden md:flex relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white p-12 flex-col justify-between overflow-hidden">

            {/* Decorative Circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-white/10 rounded-full" />

            <div className="relative z-10">

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl shadow-lg">
                  ✦
                </div>

                <div>
                  <h1 className="text-xl font-bold">
                    PKL Attendance
                  </h1>

                  <p className="text-blue-100 text-xs">
                    Sistem Informasi PKL
                  </p>
                </div>
              </div>

              {/* Main Text */}
              <div className="mt-20">
                <p className="text-blue-200 text-sm font-medium mb-3">
                  DIGITAL ATTENDANCE SYSTEM
                </p>

                <h2 className="text-4xl font-bold leading-tight">
                  Kelola kegiatan
                  <br />
                  PKL lebih mudah.
                </h2>

                <p className="text-blue-100 mt-5 leading-relaxed max-w-sm">
                  Satu platform untuk mengelola presensi,
                  jurnal, jadwal, pengumuman, dan monitoring
                  kegiatan PKL siswa.
                </p>
              </div>

              {/* Feature */}
              <div className="mt-8 space-y-3">

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm text-blue-50">
                    Presensi digital
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm text-blue-50">
                    Jurnal kegiatan PKL
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-sm text-blue-50">
                    Monitoring siswa
                  </span>
                </div>

              </div>
            </div>

            <div className="relative z-10 text-xs text-blue-200">
              © 2026 PKL Attendance
            </div>
          </section>

          {/* ================= RIGHT ================= */}
          <section className="p-7 sm:p-10 md:p-12 flex items-center">

            <div className="w-full max-w-md mx-auto">

              {/* Mobile Logo */}
              <div className="md:hidden text-center mb-8">

                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg">
                  ✦
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mt-4">
                  PKL Attendance
                </h1>

                <p className="text-slate-500 text-sm mt-1">
                  Sistem Informasi PKL
                </p>

              </div>

              {/* Heading */}
              <div className="mb-8">

                <p className="text-blue-600 text-sm font-semibold mb-2">
                  WELCOME BACK 👋
                </p>

                <h2 className="text-3xl font-bold text-slate-800">
                  Selamat datang!
                </h2>

                <p className="text-slate-500 mt-2 text-sm">
                  Silakan masuk untuk melanjutkan ke
                  sistem PKL kamu.
                </p>

              </div>

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      👤
                    </span>

                    <input
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                    />

                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔒
                    </span>

                    <input
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                    />

                  </div>
                </div>

                {/* Error */}
                {message && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                    ⚠️ {message}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl py-3.5 shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">
                        ◌
                      </span>
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Masuk ke Sistem
                      <span>→</span>
                    </span>
                  )}
                </button>

              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                  PKL Attendance System
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Sistem Presensi dan Monitoring PKL
                </p>
              </div>

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}