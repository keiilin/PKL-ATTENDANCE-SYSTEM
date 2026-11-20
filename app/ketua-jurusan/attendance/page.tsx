
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
};

type Attendance = {
  id: number;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
  user: User;
};

type LoggedUser = {
  id: number;
  nama: string;
  username?: string;
  role: string;
};

export default function KetuaJurusanAttendancePage() {
  const router = useRouter();

  const [user, setUser] = useState<LoggedUser | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "KETUA_JURUSAN") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const getAttendances = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/ketua-jurusan/attendance");
      const data = await response.json();

      if (response.ok) {
        setAttendances(data.data || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAttendances();
    }
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDateKey = (date: string) => {
    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";

    return new Date(time).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "HADIR":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "TERLAMBAT":
        return "bg-amber-50 text-amber-700 border-amber-100";

      case "IZIN":
        return "bg-blue-50 text-blue-700 border-blue-100";

      case "SAKIT":
        return "bg-purple-50 text-purple-700 border-purple-100";

      case "ALPA":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const filteredAttendances = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return attendances.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.user?.nama?.toLowerCase().includes(keyword) ||
        item.user?.kelas?.toLowerCase().includes(keyword) ||
        item.user?.jurusan?.toLowerCase().includes(keyword) ||
        item.user?.tempatPkl?.toLowerCase().includes(keyword) ||
        item.status?.toLowerCase().includes(keyword);

      const tanggal = getDateKey(item.tanggal);

      const matchesTanggalAwal =
        !tanggalAwal || tanggal >= tanggalAwal;

      const matchesTanggalAkhir =
        !tanggalAkhir || tanggal <= tanggalAkhir;

      const matchesStatus =
        statusFilter === "SEMUA" ||
        item.status?.toUpperCase() === statusFilter;

      return (
        matchesSearch &&
        matchesTanggalAwal &&
        matchesTanggalAkhir &&
        matchesStatus
      );
    });
  }, [
    attendances,
    search,
    statusFilter,
    tanggalAwal,
    tanggalAkhir,
  ]);

  const totalAttendance = filteredAttendances.length;

  const totalStudents = new Set(
    filteredAttendances
      .map((item) => item.user?.id)
      .filter(Boolean)
  ).size;

  const totalHadir = filteredAttendances.filter(
    (item) => item.status?.toUpperCase() === "HADIR"
  ).length;

  const totalTerlambat = filteredAttendances.filter(
    (item) => item.status?.toUpperCase() === "TERLAMBAT"
  ).length;

  const totalIzin = filteredAttendances.filter(
    (item) => item.status?.toUpperCase() === "IZIN"
  ).length;

  const totalSakit = filteredAttendances.filter(
    (item) => item.status?.toUpperCase() === "SAKIT"
  ).length;

  const totalAlpa = filteredAttendances.filter(
    (item) => item.status?.toUpperCase() === "ALPA"
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("SEMUA");
    setTanggalAwal("");
    setTanggalAkhir("");
  };

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <span className="text-2xl animate-pulse">📊</span>
          </div>

          <p className="font-semibold text-slate-700">
            Memuat data absensi...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #555;
            padding: 6px;
            text-align: left;
          }

          .print-table th {
            background: #e5e7eb !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-summary {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-top: 16px;
          }

          .print-summary div {
            border: 1px solid #777;
            padding: 8px;
          }

          .print-signature {
            display: flex;
            justify-content: flex-end;
            margin-top: 35px;
          }
        }

        .print-only {
          display: none;
        }
      `}</style>

      {/* LAPORAN CETAK */}
      <section className="print-only">
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold" }}>
            LAPORAN REKAPITULASI ABSENSI SISWA PKL
          </h1>

          <h2 style={{ fontSize: "14px", fontWeight: "bold" }}>
            PKL ATTENDANCE
          </h2>

          <p style={{ fontSize: "11px", marginTop: "5px" }}>
            Laporan Monitoring Kehadiran Siswa Praktik Kerja Lapangan
          </p>

          <hr style={{ marginTop: "12px", border: "1px solid black" }} />
        </div>

        <div style={{ fontSize: "11px", marginBottom: "12px" }}>
          <p>
            <strong>Nama Ketua Jurusan:</strong> {user.nama}
          </p>

          <p>
            <strong>Periode:</strong>{" "}
            {tanggalAwal ? formatDate(tanggalAwal) : "Semua tanggal"}
            {" s.d. "}
            {tanggalAkhir ? formatDate(tanggalAkhir) : "Semua tanggal"}
          </p>

          <p>
            <strong>Filter Status:</strong> {statusFilter}
          </p>

          <p>
            <strong>Pencarian:</strong> {search || "-"}
          </p>

          <p>
            <strong>Tanggal Cetak:</strong>{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Jurusan</th>
              <th>Tempat PKL</th>
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Jam Pulang</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredAttendances.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.user?.nama || "-"}</td>
                <td>{item.user?.kelas || "-"}</td>
                <td>{item.user?.jurusan || "-"}</td>
                <td>{item.user?.tempatPkl || "-"}</td>
                <td>{formatDate(item.tanggal)}</td>
                <td>{formatTime(item.jamMasuk)}</td>
                <td>{formatTime(item.jamPulang)}</td>
                <td>{item.status || "-"}</td>
              </tr>
            ))}

            {filteredAttendances.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>
                  Tidak ada data absensi pada filter yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="print-summary">
          <div>
            <strong>Total Absensi</strong>
            <p>{totalAttendance}</p>
          </div>

          <div>
            <strong>Hadir</strong>
            <p>{totalHadir}</p>
          </div>

          <div>
            <strong>Terlambat</strong>
            <p>{totalTerlambat}</p>
          </div>

          <div>
            <strong>Izin / Sakit</strong>
            <p>{totalIzin + totalSakit}</p>
          </div>

          <div>
            <strong>Alpa</strong>
            <p>{totalAlpa}</p>
          </div>
        </div>

        <div className="print-signature">
          <div style={{ width: "230px", textAlign: "center", fontSize: "11px" }}>
            <p>
              Mengetahui,
              <br />
              Ketua Jurusan
            </p>

            <div style={{ height: "65px" }} />

            <p>
              <strong>{user.nama}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* HALAMAN MONITORING */}
      <main className="no-print min-h-screen bg-[#f7f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <span>Ketua Jurusan</span>
                <span>/</span>
                <span className="text-slate-600 font-medium">
                  Monitoring Absensi
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Monitoring Absensi
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-1">
                Pantau kehadiran seluruh siswa yang sedang melaksanakan PKL.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={getAttendances}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-200 transition disabled:opacity-60"
              >
                <span>↻</span>
                Refresh Data
              </button>

              <button
                onClick={handlePrint}
                disabled={filteredAttendances.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                <span>🖨️</span>
                Cetak Rekap
              </button>
            </div>
          </div>

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
            <div className="absolute -right-5 -top-10 text-[100px] opacity-15">
              📊
            </div>

            <div className="absolute right-32 bottom-0 text-7xl opacity-10">
              ✓
            </div>

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
                <span>📅</span>
                Monitoring Kehadiran
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Pantau Absensi Siswa PKL
              </h2>

              <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
                Lihat data kehadiran, waktu masuk, waktu pulang, dan
                status absensi siswa secara terpusat.
              </p>
            </div>
          </section>

          {/* STATISTIK */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "ABSENSI",
                value: totalAttendance,
                description: "Total data absensi",
                icon: "📋",
                color: "bg-blue-50",
              },
              {
                label: "SISWA",
                value: totalStudents,
                description: "Siswa tercatat",
                icon: "👨‍🎓",
                color: "bg-indigo-50",
              },
              {
                label: "HADIR",
                value: totalHadir,
                description: "Kehadiran tepat waktu",
                icon: "✅",
                color: "bg-emerald-50",
              },
              {
                label: "TERLAMBAT",
                value: totalTerlambat,
                description: "Kehadiran terlambat",
                icon: "⏰",
                color: "bg-amber-50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl ${stat.color} flex items-center justify-center text-xl`}>
                    {stat.icon}
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {stat.label}
                  </span>
                </div>

                <p className="text-2xl font-bold text-slate-800 mt-4">
                  {stat.value}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          {/* FILTER */}
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-slate-800">
                  Filter dan Pencarian
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Atur data yang ingin ditampilkan dalam rekap.
                </p>
              </div>

              <button
                onClick={resetFilter}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Reset Filter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Cari Data
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama, kelas, jurusan, tempat PKL..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Tanggal Awal
                </label>

                <input
                  type="date"
                  value={tanggalAwal}
                  max={tanggalAkhir || undefined}
                  onChange={(e) => setTanggalAwal(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Tanggal Akhir
                </label>

                <input
                  type="date"
                  value={tanggalAkhir}
                  min={tanggalAwal || undefined}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Status Kehadiran
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="HADIR">Hadir</option>
                  <option value="TERLAMBAT">Terlambat</option>
                  <option value="IZIN">Izin</option>
                  <option value="SAKIT">Sakit</option>
                  <option value="ALPA">Alpa</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 flex items-end">
                <p className="text-sm text-slate-500">
                  Ditemukan{" "}
                  <strong className="text-blue-700">
                    {filteredAttendances.length}
                  </strong>{" "}
                  data absensi.
                </p>
              </div>
            </div>
          </div>

          {/* DATA ABSENSI */}
          <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Data Kehadiran Siswa
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Daftar absensi siswa PKL yang tercatat pada sistem.
              </p>
            </div>

            {filteredAttendances.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl mb-4">
                  📭
                </div>

                <h3 className="font-bold text-slate-700">
                  Data tidak ditemukan
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Coba ubah kata kunci atau filter yang dipilih.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          "No",
                          "Siswa",
                          "Tempat PKL",
                          "Tanggal",
                          "Jam Masuk",
                          "Jam Pulang",
                          "Status",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAttendances.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-50 hover:bg-blue-50/30 transition"
                        >
                          <td className="px-5 py-4 text-sm text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold">
                                {item.user?.nama?.charAt(0)?.toUpperCase() || "S"}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-700">
                                  {item.user?.nama || "-"}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {item.user?.kelas || "-"}
                                  {item.user?.jurusan
                                    ? ` • ${item.user.jurusan}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">
                                🏢
                              </span>

                              <span className="text-sm font-medium text-slate-700">
                                {item.user?.tempatPkl || "-"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(item.tanggal)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                              {formatTime(item.jamMasuk)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-xl bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600">
                              {formatTime(item.jamPulang)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(item.status)}`}>
                              {item.status || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE / TABLET */}
                <div className="lg:hidden divide-y divide-slate-100">
                  {filteredAttendances.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-5 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold">
                            {item.user?.nama?.charAt(0)?.toUpperCase() || "S"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">
                              {item.user?.nama || "-"}
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.user?.kelas || "-"} •{" "}
                              {item.user?.jurusan || "-"}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-slate-400">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">
                            Status
                          </p>

                          <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(item.status)}`}>
                            {item.status || "-"}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">
                            Tanggal
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(item.tanggal)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-2xl bg-blue-50 p-3">
                          <p className="text-xs text-blue-500 mb-1">
                            Jam Masuk
                          </p>

                          <p className="text-sm font-bold text-blue-700">
                            {formatTime(item.jamMasuk)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400 mb-1">
                            Jam Pulang
                          </p>

                          <p className="text-sm font-bold text-slate-700">
                            {formatTime(item.jamPulang)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-600 mb-1">
                          Tempat PKL
                        </p>

                        <p className="text-sm font-bold text-emerald-700">
                          {item.user?.tempatPkl || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* RINGKASAN STATUS */}
          <section className="mt-6 bg-white rounded-[24px] border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 mb-4">
              Ringkasan Status Kehadiran
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">Hadir</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {totalHadir}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs text-amber-600">Terlambat</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {totalTerlambat}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs text-blue-600">Izin</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {totalIzin}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="text-xs text-purple-600">Sakit</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {totalSakit}
                </p>
              </div>

              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-xs text-rose-600">Alpa</p>
                <p className="text-2xl font-bold text-rose-700 mt-1">
                  {totalAlpa}
                </p>
              </div>
            </div>
          </section>

          {/* INFO */}
          <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
                💡
              </div>

              <div>
                <h3 className="font-bold text-blue-900">
                  Informasi Monitoring
                </h3>

                <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                  Data pada halaman ini digunakan untuk memantau kehadiran
                  siswa PKL. Gunakan pencarian dan filter tanggal untuk
                  menemukan data tertentu. Tombol Cetak Rekap dapat
                  digunakan untuk mencetak laporan atau menyimpannya
                  sebagai PDF.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400">
              PKL Attendance • Monitoring Absensi Ketua Jurusan
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
