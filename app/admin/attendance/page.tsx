
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
    id: number;
    nama: string;
    kelas: string | null;
    jurusan?: string | null;
    tempatPkl: string | null;
  };
};

export default function HistoryPage() {
  const router = useRouter();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("SEMUA");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");

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
        `/api/admin/attendance?adminId=${user.id}`
      );

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("API tidak mengembalikan data JSON");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data absensi");
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

  // Mengubah tanggal menjadi format YYYY-MM-DD
  // berdasarkan waktu lokal perangkat.
  const getTanggalKey = (tanggal: string) => {
    if (!tanggal) return "";

    const date = new Date(tanggal);

    if (isNaN(date.getTime())) return "";

    const tahun = date.getFullYear();
    const bulan = String(date.getMonth() + 1).padStart(2, "0");
    const hari = String(date.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
  };

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

  const getStatus = (item: Attendance) => {
    if (item.jamPulang) return "SELESAI";
    if (item.jamMasuk) return "SEDANG PKL";
    return "BELUM MASUK";
  };

  // Pencarian dan filter data
  const filteredAttendances = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return attendances.filter((item) => {
      const nama = item.user?.nama?.toLowerCase() || "";
      const kelas = item.user?.kelas?.toLowerCase() || "";
      const tempat = item.user?.tempatPkl?.toLowerCase() || "";
      const jurusan = item.user?.jurusan?.toLowerCase() || "";

      const matchesSearch =
        !keyword ||
        nama.includes(keyword) ||
        kelas.includes(keyword) ||
        tempat.includes(keyword) ||
        jurusan.includes(keyword);

      const status = getStatus(item);
      const matchesFilter = filter === "SEMUA" || status === filter;

      const tanggal = getTanggalKey(item.tanggal);

      const matchesTanggalMulai =
        !tanggalMulai || tanggal >= tanggalMulai;

      const matchesTanggalAkhir =
        !tanggalAkhir || tanggal <= tanggalAkhir;

      return (
        matchesSearch &&
        matchesFilter &&
        matchesTanggalMulai &&
        matchesTanggalAkhir
      );
    });
  }, [attendances, search, filter, tanggalMulai, tanggalAkhir]);

  const totalSelesai = filteredAttendances.filter(
    (item) => item.jamPulang
  ).length;

  const totalMasihPkl = filteredAttendances.filter(
    (item) => item.jamMasuk && !item.jamPulang
  ).length;

  const totalBelumMasuk = filteredAttendances.filter(
    (item) => !item.jamMasuk
  ).length;

  const statusBadge = (item: Attendance) => {
    if (item.jamPulang) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          ✓ Selesai
        </span>
      );
    }

    if (item.jamMasuk) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
          ● Sedang PKL
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        — Belum Masuk
      </span>
    );
  };

  const handleResetFilter = () => {
    setSearch("");
    setFilter("SEMUA");
    setTanggalMulai("");
    setTanggalAkhir("");
  };

  const handleCetakLaporan = () => {
    if (filteredAttendances.length === 0) {
      alert("Tidak ada data absensi yang dapat dicetak.");
      return;
    }

    window.print();
  };

  const keteranganPeriode = () => {
    if (!tanggalMulai && !tanggalAkhir) {
      return "Seluruh Periode";
    }

    if (tanggalMulai && tanggalAkhir) {
      return `${formatTanggal(tanggalMulai)} sampai ${formatTanggal(
        tanggalAkhir
      )}`;
    }

    if (tanggalMulai) {
      return `Mulai ${formatTanggal(tanggalMulai)}`;
    }

    return `Sampai ${formatTanggal(tanggalAkhir)}`;
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* TAMPILAN HALAMAN ADMIN */}
      <div className="mx-auto max-w-7xl print:hidden">
        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-28 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  📋 ADMIN • MONITORING
                </div>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  Riwayat Absensi
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Riwayat kehadiran seluruh siswa PKL yang tersimpan
                  dalam sistem.
                </p>
              </div>

              <button
                onClick={getAttendances}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60"
              >
                🔄 {loading ? "Memuat..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* STATISTIK */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Riwayat
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {filteredAttendances.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Sudah Selesai
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {totalSelesai}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Masih PKL
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalMasihPkl}
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Belum Masuk
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-600">
              {totalBelumMasuk}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">
              Filter Riwayat
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Cari data berdasarkan siswa, status, atau periode tanggal.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cari Siswa
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama, kelas, jurusan, atau tempat PKL..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="SELESAI">Selesai</option>
                <option value="SEDANG PKL">Sedang PKL</option>
                <option value="BELUM MASUK">Belum Masuk</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Dari Tanggal
              </label>

              <input
                type="date"
                value={tanggalMulai}
                max={tanggalAkhir || undefined}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sampai Tanggal
              </label>

              <input
                type="date"
                value={tanggalAkhir}
                min={tanggalMulai || undefined}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleResetFilter}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reset Filter
            </button>

            <button
              onClick={handleCetakLaporan}
              disabled={loading || filteredAttendances.length === 0}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🖨️ Cetak Laporan
            </button>
          </div>
        </div>

        {/* DATA */}
        <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-slate-800">
              Data Riwayat Kehadiran
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Menampilkan {filteredAttendances.length} data.
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">
                Memuat riwayat absensi...
              </p>
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-3 text-5xl">📭</div>
              <h3 className="font-bold text-slate-700">
                Data tidak ditemukan
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah pencarian atau filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50">
                      {[
                        "No",
                        "Siswa",
                        "Tempat PKL",
                        "Tanggal",
                        "Masuk",
                        "Pulang",
                        "Status",
                      ].map((judul) => (
                        <th
                          key={judul}
                          className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                        >
                          {judul}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendances.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">
                            {item.user?.nama || "-"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.user?.kelas || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.user?.tempatPkl || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatTanggal(item.tanggal)}
                        </td>

                        <td className="px-5 py-4">
                          {item.jamMasuk ? (
                            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                              {formatJam(item.jamMasuk)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {item.jamPulang ? (
                            <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                              {formatJam(item.jamPulang)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Belum pulang
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {statusBadge(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredAttendances.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
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

                    <div className="mt-4 space-y-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Tempat PKL
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {item.user?.tempatPkl || "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-emerald-50 p-3">
                          <p className="text-xs text-emerald-600">
                            Jam Masuk
                          </p>
                          <p className="mt-1 font-bold text-emerald-700">
                            {formatJam(item.jamMasuk)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3">
                          <p className="text-xs text-blue-600">
                            Jam Pulang
                          </p>
                          <p className="mt-1 font-bold text-blue-700">
                            {formatJam(item.jamPulang)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 p-3">
                        <p className="text-xs text-slate-400">
                          Tanggal
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatTanggal(item.tanggal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="text-xl">ℹ️</div>

            <div>
              <h3 className="font-bold text-blue-800">
                Informasi Riwayat
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Halaman ini digunakan untuk melihat riwayat kehadiran
                siswa PKL yang telah tersimpan dalam sistem.
              </p>
            </div>
          </div>
        </div>

        <footer className="py-8 text-center text-xs text-slate-400">
          PKL Attendance • Admin Panel
        </footer>
      </div>

      {/* LAPORAN KHUSUS CETAK */}
      <section className="hidden bg-white p-8 text-black print:block">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold uppercase">
            Laporan Rekapitulasi Absensi Siswa PKL
          </h1>

          <p className="mt-2 text-sm">
            Sistem Informasi PKL Attendance
          </p>

          <div className="mt-4 border-b-2 border-black" />
        </div>

        <div className="mb-4 text-sm">
          <p>
            <strong>Periode:</strong> {keteranganPeriode()}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {filter === "SEMUA" ? "Semua Status" : filter}
          </p>

          <p>
            <strong>Pencarian:</strong> {search || "Semua Siswa"}
          </p>

          <p>
            <strong>Jumlah Data:</strong>{" "}
            {filteredAttendances.length} data
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

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {[
                "No",
                "Nama Siswa",
                "Kelas",
                "Tempat PKL",
                "Tanggal",
                "Jam Masuk",
                "Jam Pulang",
                "Status",
              ].map((judul) => (
                <th
                  key={judul}
                  className="border border-black px-2 py-2 text-center font-bold"
                >
                  {judul}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredAttendances.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-2 py-2 text-center">
                  {index + 1}
                </td>

                <td className="border border-black px-2 py-2">
                  {item.user?.nama || "-"}
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  {item.user?.kelas || "-"}
                </td>

                <td className="border border-black px-2 py-2">
                  {item.user?.tempatPkl || "-"}
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  {formatTanggal(item.tanggal)}
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  {formatJam(item.jamMasuk)}
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  {formatJam(item.jamPulang)}
                </td>

                <td className="border border-black px-2 py-2 text-center">
                  {getStatus(item) === "SELESAI"
                    ? "Selesai"
                    : getStatus(item) === "SEDANG PKL"
                    ? "Sedang PKL"
                    : "Belum Masuk"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <p>
            <strong>Total Selesai:</strong> {totalSelesai}
          </p>

          <p>
            <strong>Total Masih PKL:</strong> {totalMasihPkl}
          </p>

          <p>
            <strong>Total Belum Masuk:</strong> {totalBelumMasuk}
          </p>
        </div>

        <div className="mt-16 flex justify-end">
          <div className="w-64 text-center text-sm">
            <p>Mengetahui,</p>
            <p className="mt-1">Admin PKL</p>
            <div className="h-20" />
            <p className="font-bold underline">
              ....................................
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
