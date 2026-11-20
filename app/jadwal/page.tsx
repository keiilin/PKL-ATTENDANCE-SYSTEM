
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
};

type Schedule = {
  id: number;
  hari: string;
  jamMasuk: string;
  jamPulang: string;
};

const daftarHari = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export default function JadwalPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    hari: "Senin",
    jamMasuk: "",
    jamPulang: "",
  });

  // ==========================================
  // CEK LOGIN DAN ROLE SISWA
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "SISWA") {
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Data pengguna tidak valid:", error);
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  // ==========================================
  // MENGAMBIL DATA JADWAL
  // ==========================================
  const getSchedules = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/schedule?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data jadwal.");
        return;
      }

      setSchedules(data.data || []);
    } catch (error) {
      console.error("Gagal mengambil jadwal:", error);
      alert("Terjadi kesalahan saat mengambil data jadwal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getSchedules();
    }
  }, [user]);

  // ==========================================
  // MENAMBAHKAN JADWAL
  // ==========================================
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user) return;

    if (!form.jamMasuk || !form.jamPulang) {
      alert("Jam masuk dan jam pulang wajib diisi.");
      return;
    }

    if (form.jamMasuk >= form.jamPulang) {
      alert("Jam pulang harus lebih besar dari jam masuk.");
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menyimpan jadwal.");
        return;
      }

      alert(data.message || "Jadwal berhasil disimpan.");

      setForm({
        hari: "Senin",
        jamMasuk: "",
        jamPulang: "",
      });

      setShowForm(false);

      await getSchedules();
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);
      alert("Terjadi kesalahan saat menyimpan jadwal.");
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // MENGHAPUS JADWAL
  // ==========================================
  const handleDelete = async (id: number) => {
    const confirmation = window.confirm(
      "Apakah kamu yakin ingin menghapus jadwal ini?"
    );

    if (!confirmation) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/schedule?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus jadwal.");
        return;
      }

      alert(data.message || "Jadwal berhasil dihapus.");

      await getSchedules();
    } catch (error) {
      console.error("Gagal menghapus jadwal:", error);
      alert("Terjadi kesalahan saat menghapus jadwal.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // TAMPILAN LOADING AWAL
  // ==========================================
  if (!user || loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
            🕒
          </div>

          <p className="text-sm font-semibold text-slate-500">
            Memuat jadwal...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // TAMPILAN UTAMA
  // ==========================================
  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <button
                  onClick={() => router.push("/siswa")}
                  className="hover:text-blue-600 transition"
                >
                  Dashboard
                </button>

                <span>•</span>

                <span className="text-indigo-600 font-semibold">
                  Jadwal PKL
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Jadwal PKL 🗓️
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl leading-relaxed">
                Atur jadwal masuk dan pulang sesuai
                dengan ketentuan tempat PKL kamu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={getSchedules}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                ↻ Refresh
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
                  showForm
                    ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {showForm ? "Tutup Form" : "+ Tambah Jadwal"}
              </button>
            </div>
          </div>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg mb-6">
          <div className="absolute -right-10 -top-12 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-28 -bottom-16 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute left-1/2 -top-20 w-28 h-28 rounded-full bg-white/5" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl shrink-0">
              ⏰
            </div>

            <div>
              <p className="text-blue-100 text-sm font-semibold">
                Jadwal PKL Pribadi
              </p>

              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Atur waktu kerja kamu dengan mudah
              </h2>

              <p className="text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
                Setiap siswa dapat memiliki jadwal
                yang berbeda sesuai aturan tempat PKL
                masing-masing.
              </p>
            </div>
          </div>
        </div>

        {/* FORM TAMBAH JADWAL */}
        {showForm && (
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 sm:p-7 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Tambah Jadwal
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Masukkan waktu kerja sesuai jadwal
                  di tempat PKL kamu.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* HARI */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hari
                </label>

                <select
                  value={form.hari}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hari: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  {daftarHari.map((hari) => (
                    <option key={hari} value={hari}>
                      {hari}
                    </option>
                  ))}
                </select>
              </div>

              {/* JAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Jam Masuk
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg">
                      🌅
                    </span>

                    <input
                      type="time"
                      value={form.jamMasuk}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jamMasuk: e.target.value,
                        })
                      }
                      required
                      className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Jam Pulang
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 text-lg">
                      🌇
                    </span>

                    <input
                      type="time"
                      value={form.jamPulang}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jamPulang: e.target.value,
                        })
                      }
                      required
                      className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-purple-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* PREVIEW */}
              {(form.jamMasuk || form.jamPulang) && (
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    Preview Jadwal
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="font-bold text-slate-800">
                      {form.hari}
                    </span>

                    {form.jamMasuk && (
                      <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-100 text-sm font-semibold text-blue-700 shadow-sm">
                        🌅 {form.jamMasuk}
                      </span>
                    )}

                    <span className="text-slate-400">
                      →
                    </span>

                    {form.jamPulang && (
                      <span className="px-3 py-1.5 rounded-xl bg-white border border-purple-100 text-sm font-semibold text-purple-700 shadow-sm">
                        🌇 {form.jamPulang}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* BUTTON */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
                >
                  {processing
                    ? "Menyimpan..."
                    : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST JADWAL */}
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    📅
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Jadwal Saya
                  </h2>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  Jadwal rutin selama pelaksanaan PKL.
                </p>
              </div>

              {schedules.length > 0 && (
                <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  {schedules.length} Jadwal
                </div>
              )}
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse">
                🕒
              </div>

              <p className="text-sm font-semibold text-slate-500">
                Memuat jadwal...
              </p>
            </div>
          ) : schedules.length === 0 ? (
            /* EMPTY */
            <div className="p-10 sm:p-16 text-center">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-4xl mx-auto mb-5">
                🗓️
              </div>

              <h3 className="font-bold text-lg text-slate-900">
                Belum Ada Jadwal
              </h3>

              <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                Tambahkan jadwal PKL kamu terlebih
                dahulu agar waktu masuk dan pulang
                lebih teratur.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:shadow-md transition"
              >
                + Tambah Jadwal
              </button>
            </div>
          ) : (
            /* SCHEDULE LIST */
            <div className="p-4 sm:p-5 space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="group rounded-2xl border border-slate-100 bg-[#fafbfe] hover:bg-white hover:border-blue-100 hover:shadow-sm p-4 sm:p-5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-2xl shrink-0">
                        🕒
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900">
                            {schedule.hari}
                          </h3>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                            Aktif
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
                            🌅 {schedule.jamMasuk}
                          </span>

                          <span className="text-slate-400 text-sm">
                            sampai
                          </span>

                          <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold">
                            🌇 {schedule.jamPulang}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deletingId === schedule.id}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === schedule.id
                        ? "Menghapus..."
                        : "🗑️ Hapus"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="mt-5 flex items-start gap-3 px-4 py-4 rounded-2xl bg-amber-50 border border-amber-100">
          <span className="text-lg shrink-0">
            💡
          </span>

          <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
            Pastikan jadwal yang kamu masukkan sesuai
            dengan jam kerja di tempat PKL agar data
            kehadiran dapat digunakan dengan tepat.
          </p>
        </div>

        {/* FOOTER */}
        <div className="text-center py-8">
          <p className="text-xs text-slate-400">
            PKL Attendance • Jadwal PKL
          </p>
        </div>
      </div>
    </main>
  );
}
