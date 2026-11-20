"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "SISWA") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const getHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let url = `/api/history?userId=${user.id}`;

      if (startDate) {
        url += `&startDate=${startDate}`;
      }

      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAttendances(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getHistory();
    }
  }, [user]);

  const handleFilter = () => {
    getHistory();
  };

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      getHistory();
    }, 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalAbsensi = attendances.length;

  const sudahPulang = attendances.filter(
    (item) => item.jamPulang
  ).length;

  const belumPulang = attendances.filter(
    (item) => !item.jamPulang
  ).length;

  if (loading && !user) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg animate-pulse">
            📋
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Memuat riwayat...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600">
              Data Kehadiran
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />

            <span className="text-xs sm:text-sm text-slate-400">
              Riwayat PKL
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            Riwayat Absensi
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl">
            Lihat seluruh riwayat kehadiran PKL kamu dan gunakan
            filter untuk mencari data berdasarkan tanggal.
          </p>
        </div>

        {/* SUMMARY HERO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 mb-6 shadow-xl shadow-blue-100">

          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div>
                <p className="text-xs sm:text-sm text-blue-100">
                  Ringkasan Kehadiran
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  Rekap Absensi Kamu
                </h2>

                <p className="text-sm text-blue-100 mt-2">
                  Pantau data presensi PKL secara berkala.
                </p>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl sm:text-4xl">
                📊
              </div>

            </div>

            {/* MINI STATS */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">

              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-blue-100">
                  Total
                </p>

                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {totalAbsensi}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-blue-100">
                  Pulang
                </p>

                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {sudahPulang}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs text-blue-100">
                  Belum
                </p>

                <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {belumPulang}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                📋
              </div>

              <span className="text-xs font-medium text-blue-500">
                Rekap
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-4">
              Total Absensi
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
              {totalAbsensi}
            </h2>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
                ✓
              </div>

              <span className="text-xs font-medium text-emerald-500">
                Selesai
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-4">
              Sudah Pulang
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
              {sudahPulang}
            </h2>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
                ⏳
              </div>

              <span className="text-xs font-medium text-amber-500">
                Aktif
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mt-4">
              Belum Pulang
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">
              {belumPulang}
            </h2>
          </div>

        </div>

        {/* FILTER */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
              🔎
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Filter Riwayat
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Pilih rentang tanggal untuk melihat data tertentu.
              </p>
            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* DARI */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Dari Tanggal
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400"
              />
            </div>

            {/* SAMPAI */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Sampai Tanggal
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-400"
              />
            </div>

            {/* BUTTON */}
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">

              <button
                onClick={handleFilter}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-blue-100 transition"
              >
                🔎
                Terapkan
              </button>

              <button
                onClick={resetFilter}
                className="px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm transition"
              >
                Reset
              </button>

            </div>
          </div>
        </div>

        {/* TITLE RIWAYAT */}
        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Daftar Kehadiran
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Data presensi yang tersimpan di sistem.
            </p>
          </div>

          {attendances.length > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              {attendances.length} Data
            </span>
          )}

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">

            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 flex items-center justify-center text-lg animate-pulse">
              📋
            </div>

            <p className="text-sm font-medium text-slate-500 mt-4">
              Memuat data absensi...
            </p>

          </div>
        ) : attendances.length === 0 ? (

          /* EMPTY STATE */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 sm:p-14 text-center">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 flex items-center justify-center text-4xl">
              📅
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-5">
              Belum Ada Riwayat
            </h2>

            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Kamu belum memiliki data absensi pada periode yang
              dipilih.
            </p>

          </div>
        ) : (

          /* HISTORY LIST */
          <div className="space-y-4">

            {attendances.map((item) => (

              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
              >

                {/* TOP */}
                <div className="p-5 sm:p-6">

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                        📅
                      </div>

                      <div>
                        <h2 className="font-bold text-base sm:text-lg text-slate-800">
                          {formatDate(item.tanggal)}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Catatan kehadiran PKL
                        </p>
                      </div>

                    </div>

                    <span
                      className={`w-fit px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                        item.status === "HADIR"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "TERLAMBAT"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* JAM */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5">

                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          🟢
                        </span>

                        <p className="text-xs sm:text-sm font-medium text-blue-600">
                          Jam Masuk
                        </p>
                      </div>

                      <p className="font-bold text-xl sm:text-2xl text-slate-800 mt-2">
                        {formatTime(item.jamMasuk)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          🔴
                        </span>

                        <p className="text-xs sm:text-sm font-medium text-rose-600">
                          Jam Pulang
                        </p>
                      </div>

                      <p className="font-bold text-xl sm:text-2xl text-slate-800 mt-2">
                        {formatTime(item.jamPulang)}
                      </p>
                    </div>

                  </div>

                  {/* ALASAN */}
                  {(item.alasanTerlambat ||
                    item.alasanPulangTelat) && (

                    <div className="mt-5 grid sm:grid-cols-2 gap-3">

                      {item.alasanTerlambat && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <span>⚠️</span>

                            <p className="font-semibold text-sm text-amber-700">
                              Alasan Terlambat
                            </p>
                          </div>

                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {item.alasanTerlambat}
                          </p>
                        </div>
                      )}

                      {item.alasanPulangTelat && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                          <div className="flex items-center gap-2">
                            <span>🕐</span>

                            <p className="font-semibold text-sm text-orange-700">
                              Alasan Pulang Telat
                            </p>
                          </div>

                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {item.alasanPulangTelat}
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                  {/* FOTO */}
                  {(item.fotoMasuk || item.fotoPulang) && (

                    <div className="mt-5">

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">
                          📸
                        </span>

                        <p className="text-sm font-semibold text-slate-700">
                          Dokumentasi Absensi
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">

                        {item.fotoMasuk && (
                          <div>
                            <p className="text-xs font-medium text-slate-400 mb-2">
                              Foto Masuk
                            </p>

                            <img
                              src={item.fotoMasuk}
                              alt="Foto masuk"
                              className="w-full h-40 sm:h-52 object-cover rounded-xl border border-slate-200"
                            />
                          </div>
                        )}

                        {item.fotoPulang && (
                          <div>
                            <p className="text-xs font-medium text-slate-400 mb-2">
                              Foto Pulang
                            </p>

                            <img
                              src={item.fotoPulang}
                              alt="Foto pulang"
                              className="w-full h-40 sm:h-52 object-cover rounded-xl border border-slate-200"
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Riwayat kehadiran siswa
          </p>
        </div>

      </div>
    </main>
  );
}