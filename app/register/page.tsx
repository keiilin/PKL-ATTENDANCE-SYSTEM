"use client";

import { FormEvent, useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    nis: "",
    kelas: "",
    jurusan: "",
    tempatPkl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Pendaftaran gagal.");
        return;
      }

      alert("Pendaftaran berhasil!");
      router.push("/login");
    } catch (error) {
      console.error(error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT - INFO */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute right-12 top-1/2 h-16 w-16 rounded-full bg-white/5" />

            <div className="relative">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-sm">
                🎓
              </div>

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                PKL Attendance
              </p>

              <h1 className="max-w-sm text-4xl font-bold leading-tight">
                Mulai perjalanan PKL-mu dengan lebih teratur.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-blue-100">
                Buat akun untuk mengakses sistem kehadiran, jadwal,
                jurnal kegiatan, dan berbagai informasi PKL dalam satu
                tempat.
              </p>
            </div>

            <div className="relative space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  ✓
                </span>
                <span className="text-sm text-blue-50">
                  Kelola kehadiran PKL
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  📅
                </span>
                <span className="text-sm text-blue-50">
                  Pantau jadwal kegiatan
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  📝
                </span>
                <span className="text-sm text-blue-50">
                  Catat jurnal PKL
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT - FORM */}
          <section className="p-6 sm:p-8 lg:p-10">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl shadow-md">
                🎓
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  PKL Attendance
                </p>
                <p className="text-xs text-slate-500">
                  Sistem Kehadiran Siswa PKL
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                ✨ Buat akun baru
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                Daftar Akun
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Lengkapi data berikut untuk membuat akun siswa PKL.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
                <span className="mt-0.5">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nama */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Lengkap
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>

                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    @
                  </span>

                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔒
                  </span>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Gunakan minimal 6 karakter.
                </p>
              </div>

              {/* NIS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  NIS
                  <span className="ml-1 font-normal text-slate-400">
                    (opsional)
                  </span>
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🪪
                  </span>

                  <input
                    type="text"
                    name="nis"
                    value={form.nis}
                    onChange={handleChange}
                    placeholder="Masukkan NIS"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Kelas + Jurusan */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kelas
                  </label>

                  <input
                    type="text"
                    name="kelas"
                    value={form.kelas}
                    onChange={handleChange}
                    placeholder="Contoh: XI RPL 2"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Jurusan
                  </label>

                  <input
                    type="text"
                    name="jurusan"
                    value={form.jurusan}
                    onChange={handleChange}
                    placeholder="Contoh: RPL"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Tempat PKL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tempat PKL
                  <span className="ml-1 font-normal text-slate-400">
                    (opsional)
                  </span>
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🏢
                  </span>

                  <input
                    type="text"
                    name="tempatPkl"
                    value={form.tempatPkl}
                    onChange={handleChange}
                    placeholder="Masukkan nama tempat PKL"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    Buat Akun
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Sudah memiliki akun?
                <Link
                  href="/login"
                  className="ml-1.5 font-bold text-blue-600 transition hover:text-indigo-600 hover:underline"
                >
                  Login sekarang
                </Link>
              </p>
            </div>

            <p className="mt-5 text-center text-[11px] text-slate-400">
              PKL Attendance • Sistem Informasi Kehadiran Siswa
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}