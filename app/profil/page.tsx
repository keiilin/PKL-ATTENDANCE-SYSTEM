"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  nis?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
};

export default function ProfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [tempatPkl, setTempatPkl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getProfile = async (userId: number) => {
    try {
      const response = await fetch(`/api/profile?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUser(data.data);
        setNama(data.data.nama || "");
        setKelas(data.data.kelas || "");
        setJurusan(data.data.jurusan || "");
        setTempatPkl(data.data.tempatPkl || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
        router.push("/login");
        return;
      }

      getProfile(userData.id);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          nama,
          kelas,
          jurusan,
          tempatPkl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui profil.");
        return;
      }

      const updatedUser = {
        ...user,
        nama,
        kelas,
        jurusan,
        tempatPkl,
      };

      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert(data.message || "Profil berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl text-white shadow-lg shadow-blue-100">
            <span className="animate-pulse">👤</span>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat profil...
          </p>
        </div>
      </main>
    );
  }

  const initial = user?.nama?.charAt(0)?.toUpperCase() || "S";

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
              Pengaturan Akun
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

            <span className="text-xs font-medium text-slate-400">
              Profil Siswa
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Profil Saya
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Kelola informasi data diri dan tempat PKL kamu agar informasi
            dalam sistem tetap sesuai.
          </p>
        </header>

        {/* PROFILE HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">

          {/* Decorative */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute right-24 top-10 text-5xl font-bold text-white/10">
            ✦
          </div>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/30 bg-white/15 text-3xl font-bold shadow-lg backdrop-blur-sm sm:h-24 sm:w-24 sm:text-4xl">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium text-blue-100 sm:text-sm">
                Akun Siswa PKL
              </p>

              <h2 className="truncate text-2xl font-bold sm:text-3xl">
                {user?.nama || "Nama Siswa"}
              </h2>

              <p className="mt-1 text-sm text-blue-100">
                @{user?.username || "-"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                  🎓 Siswa PKL
                </span>

                {user?.kelas && (
                  <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold">
                    📚 {user.kelas}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT */}
          <div className="space-y-6 lg:col-span-1">

            {/* IDENTITAS */}
            <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                  👤
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Identitas Akun
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Informasi dasar akun
                  </p>
                </div>
              </div>

              <div className="space-y-3">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    NIS
                  </p>

                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                    {user?.nis || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Username
                  </p>

                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                    {user?.username || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                    Status Akun
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <p className="text-sm font-bold text-emerald-700">
                      Aktif
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* INFORMASI PKL */}
            <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                  🏢
                </div>

                <div>
                  <h3 className="font-bold text-slate-800">
                    Informasi PKL
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Data pendidikan dan tempat PKL
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kelas
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    {user?.kelas || "-"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Jurusan
                  </p>

                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                    {user?.jurusan || "-"}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tempat PKL
                  </p>

                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
                    {user?.tempatPkl || "-"}
                  </p>
                </div>

              </div>
            </section>
          </div>

          {/* RIGHT FORM */}
          <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm lg:col-span-2">

            {/* FORM HEADER */}
            <div className="border-b border-slate-100 p-5 sm:p-6 md:p-7">
              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white shadow-md shadow-blue-100">
                  ✏️
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                    Informasi Profil
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Perbarui data diri dan informasi PKL kamu.
                  </p>
                </div>

              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleUpdate}
              className="space-y-5 p-5 sm:p-6 md:p-7"
            >

              {/* NAMA */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama Lengkap
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                    👤
                  </span>

                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* KELAS + JURUSAN */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kelas
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                      📚
                    </span>

                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      placeholder="Contoh: XI RPL 1"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Jurusan
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                      💻
                    </span>

                    <input
                      type="text"
                      value={jurusan}
                      onChange={(e) => setJurusan(e.target.value)}
                      placeholder="Contoh: RPL"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

              </div>

              {/* TEMPAT PKL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tempat PKL
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                    🏢
                  </span>

                  <input
                    type="text"
                    value={tempatPkl}
                    onChange={(e) => setTempatPkl(e.target.value)}
                    placeholder="Masukkan nama instansi atau perusahaan"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {/* INFO */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>

                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Pastikan data sudah benar
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-600 sm:text-sm">
                      Data profil digunakan sebagai informasi identitas
                      dalam sistem PKL dan dapat ditampilkan pada data
                      kehadiran.
                    </p>
                  </div>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none sm:w-auto"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* FOOTER */}
        <div className="py-6 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Kelola profil dengan mudah dan teratur
          </p>
        </div>
      </div>
    </main>
  );
}