"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Attendance = {
  id: number;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status?: string;
  user?: {
    id?: number;
    nama?: string;
    kelas?: string | null;
    jurusan?: string | null;
    tempatPkl?: string | null;
  };
};

export default function HistoryPage() {
  const router = useRouter();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  // =====================================================
  // LOAD DATA
  // =====================================================

  const getAttendances = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/admin/attendance/history?adminId=${user.id}`
      );

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("API tidak mengembalikan data JSON");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data absensi"
        );
      }

      setAttendances(data.data || []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data absensi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAttendances();
  }, []);

  // =====================================================
  // FORMAT
  // =====================================================

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";

    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return tanggal;
    }
  };

  const formatJam = (jam: string | null) => {
    if (!jam) return "-";

    try {
      return new Date(jam).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAttendances = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return attendances.filter((item) => {
      const selesai = Boolean(item.jamPulang);

      const matchesStatus =
        filterStatus === "SEMUA" ||
        (filterStatus === "SELESAI" && selesai) ||
        (filterStatus === "SEDANG_PKL" && !selesai);

      const matchesSearch =
        !keyword ||
        (item.user?.nama || "")
          .toLowerCase()
          .includes(keyword) ||
        (item.user?.kelas || "")
          .toLowerCase()
          .includes(keyword) ||
        (item.user?.jurusan || "")
          .toLowerCase()
          .includes(keyword) ||
        (item.user?.tempatPkl || "")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [attendances, search, filterStatus]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const total = attendances.length;

  const totalSelesai = attendances.filter(
    (item) => item.jamPulang
  ).length;

  const totalSedangPkl = attendances.filter(
    (item) => !item.jamPulang
  ).length;

  const totalSiswa = new Set(
    attendances
      .map((item) => item.user?.id)
      .filter(Boolean)
  ).size;

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const statusBadge = (item: Attendance) => {
    if (item.jamPulang) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Selesai
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Sedang PKL
      </span>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && attendances.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-semibold text-slate-600">
            Memuat riwayat absensi...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              ← Kembali ke Dashboard
            </button>

            <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
              Riwayat Absensi
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Riwayat kehadiran seluruh siswa PKL.
            </p>
          </div>

          <button
            onClick={getAttendances}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>
              ↻
            </span>

            {loading ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="relative mb-6 overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
              📊 ADMIN • RIWAYAT KEHADIRAN
            </div>

            <h2 className="text-2xl font-black sm:text-3xl">
              Pantau riwayat kehadiran siswa
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-50 sm:text-base">
              Lihat catatan kehadiran siswa PKL berdasarkan
              tanggal, jam masuk, jam pulang, dan status.
            </p>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-700">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-black">
              !
            </div>

            <div className="flex-1">
              <p className="font-bold">
                Gagal mengambil data
              </p>

              <p className="mt-0.5">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => setErrorMessage("")}
              className="text-rose-500 hover:text-rose-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Riwayat
                </p>

                <p className="mt-2 text-3xl font-black text-slate-800">
                  {total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                📋
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Seluruh data kehadiran
            </p>
          </div>

          {/* SISWA */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Siswa
                </p>

                <p className="mt-2 text-3xl font-black text-indigo-600">
                  {totalSiswa}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                👨‍🎓
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Siswa yang memiliki riwayat
            </p>
          </div>

          {/* SELESAI */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Selesai
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {totalSelesai}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                ✓
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Sudah melakukan check-out
            </p>
          </div>

          {/* SEDANG PKL */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Sedang PKL
                </p>

                <p className="mt-2 text-3xl font-black text-blue-600">
                  {totalSedangPkl}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                🕐
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Belum melakukan check-out
            </p>
          </div>
        </div>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">
              Filter Riwayat
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Cari data siswa atau filter berdasarkan status.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-2">
              {[
                ["SEMUA", "Semua"],
                ["SELESAI", "Selesai"],
                ["SEDANG_PKL", "Sedang PKL"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filterStatus === value
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, kelas, tempat PKL..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLE / DATA
        ===================================================== */}

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Riwayat Absensi
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-blue-600">
                  {filteredAttendances.length}
                </span>{" "}
                data
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
              {filterStatus === "SEMUA"
                ? "Semua Status"
                : filterStatus === "SELESAI"
                ? "Selesai"
                : "Sedang PKL"}
            </div>
          </div>

          {filteredAttendances.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                📭
              </div>

              <h3 className="font-bold text-slate-700">
                Belum ada riwayat absensi
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tidak ada data yang sesuai dengan pencarian
                atau filter.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        No
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Tempat PKL
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Masuk
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Pulang
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendances.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/30"
                      >
                        {/* NO */}

                        <td className="px-5 py-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                            {index + 1}
                          </span>
                        </td>

                        {/* SISWA */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-black text-white">
                              {(item.user?.nama || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-slate-800">
                                {item.user?.nama || "-"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.user?.kelas || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TEMPAT PKL */}

                        <td className="px-5 py-4">
                          <div className="max-w-[190px]">
                            <p className="truncate text-sm font-semibold text-slate-700">
                              {item.user?.tempatPkl || "-"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {item.user?.jurusan || "-"}
                            </p>
                          </div>
                        </td>

                        {/* TANGGAL */}

                        <td className="px-5 py-4">
                          <p className="whitespace-nowrap text-sm font-semibold text-slate-700">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </td>

                        {/* MASUK */}

                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
                            <span>🕐</span>

                            <span className="text-sm font-bold text-blue-700">
                              {formatJam(item.jamMasuk)}
                            </span>
                          </div>
                        </td>

                        {/* PULANG */}

                        <td className="px-5 py-4">
                          <div
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 ${
                              item.jamPulang
                                ? "bg-emerald-50"
                                : "bg-slate-50"
                            }`}
                          >
                            <span>
                              {item.jamPulang ? "✓" : "—"}
                            </span>

                            <span
                              className={`text-sm font-bold ${
                                item.jamPulang
                                  ? "text-emerald-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatJam(item.jamPulang)}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          {statusBadge(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="space-y-4 p-4 md:hidden">
                {filteredAttendances.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 font-black text-white">
                        {(item.user?.nama || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {item.user?.nama || "-"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.user?.kelas || "-"}
                            </p>
                          </div>

                          {statusBadge(item)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Tempat PKL
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {item.user?.tempatPkl || "-"}
                      </p>
                    </div>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Tanggal
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatTanggal(item.tanggal)}
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-blue-50 p-3">
                        <p className="text-[11px] font-semibold text-blue-400">
                          Jam Masuk
                        </p>

                        <p className="mt-1 text-lg font-black text-blue-700">
                          {formatJam(item.jamMasuk)}
                        </p>
                      </div>

                      <div
                        className={`rounded-2xl p-3 ${
                          item.jamPulang
                            ? "bg-emerald-50"
                            : "bg-slate-50"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-semibold ${
                            item.jamPulang
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          Jam Pulang
                        </p>

                        <p
                          className={`mt-1 text-lg font-black ${
                            item.jamPulang
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {formatJam(item.jamPulang)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs font-medium text-slate-400">
                        Data #{index + 1}
                      </span>

                      {statusBadge(item)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}

        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              💡
            </div>

            <div>
              <p className="font-bold text-blue-900">
                Informasi Riwayat
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Riwayat absensi menampilkan seluruh catatan
                kehadiran siswa PKL. Status{" "}
                <span className="font-bold">
                  Sedang PKL
                </span>{" "}
                berarti siswa sudah melakukan check-in tetapi
                belum melakukan check-out.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}