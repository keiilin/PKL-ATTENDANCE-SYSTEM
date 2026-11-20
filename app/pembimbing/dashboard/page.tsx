"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  role: string;
};

type Attendance = {
  id: number;
  jamMasuk: string | null;
  status: string;
  user: {
    nama: string;
    kelas: string | null;
  };
};

type DashboardData = {
  totalStudents: number;
  attendanceToday: number;
  totalJournals: number;
  recentAttendances: Attendance[];
};

export default function PembimbingDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "PEMBIMBING") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  async function getDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/pembimbing/dashboard");
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("GET DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      getDashboard();
    }
  }, [user]);

  function formatTime(value: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusStyle(status: string) {
    const normalized = status.toUpperCase();

    if (normalized === "HADIR") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (normalized === "TERLAMBAT") {
      return "bg-amber-50 text-amber-600";
    }

    if (normalized === "IZIN") {
      return "bg-blue-50 text-blue-600";
    }

    if (normalized === "SAKIT") {
      return "bg-purple-50 text-purple-600";
    }

    return "bg-slate-100 text-slate-500";
  }

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Memuat dashboard...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto max-w-7xl p-5 sm:p-7 lg:p-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Pembimbing</span>
              <span>›</span>
              <span className="text-blue-600">Dashboard</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Dashboard Pembimbing
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Selamat datang kembali, {user.nama} 👋
            </p>
          </div>

          <button
            onClick={getDashboard}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute right-20 bottom-5 text-5xl opacity-20">
            🎓
          </div>

          <div className="relative max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
              ✨ Panel Pembimbing
            </span>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              Pantau Aktivitas PKL Siswa
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Pantau kehadiran dan kegiatan siswa selama Praktik Kerja
              Lapangan melalui satu dashboard.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL SISWA */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                👨‍🎓
              </div>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                SISWA
              </span>
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              Total Siswa PKL
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {data?.totalStudents || 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Siswa dalam bimbingan
            </p>
          </div>

          {/* HADIR */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                ✓
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                HARI INI
              </span>
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              Hadir Hari Ini
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {data?.attendanceToday || 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Siswa sudah melakukan presensi
            </p>
          </div>

          {/* JURNAL */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                📝
              </div>

              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-600">
                JURNAL
              </span>
            </div>

            <p className="mt-5 text-xs font-semibold text-slate-400">
              Total Jurnal
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              {data?.totalJournals || 0}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Jurnal kegiatan siswa
            </p>
          </div>
        </div>

        {/* QUICK MENU */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="font-bold text-slate-800">
              Menu Pembimbing
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Akses fitur monitoring siswa
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* DATA SISWA */}
            <button
              onClick={() => router.push("/pembimbing/siswa")}
              className="group rounded-[22px] border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  👨‍🎓
                </div>

                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                Data Siswa
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Melihat informasi siswa yang berada dalam bimbingan.
              </p>
            </button>

            {/* ABSENSI */}
            <button
              onClick={() =>
                router.push("/pembimbing/attendance")
              }
              className="group rounded-[22px] border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-100 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                  ✓
                </div>

                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                Monitoring Absensi
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Melihat dan memantau kehadiran siswa PKL.
              </p>
            </button>

            {/* JURNAL */}
            <button
              onClick={() =>
                router.push("/pembimbing/jurnal")
              }
              className="group rounded-[22px] border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-100 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl">
                  📝
                </div>

                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-500">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                Jurnal Siswa
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Memantau kegiatan harian siswa selama PKL.
              </p>
            </button>
          </div>
        </section>

        {/* RECENT ATTENDANCE */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">

          {/* SECTION HEADER */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                📋
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Absensi Terbaru
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Data presensi siswa terbaru
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                router.push("/pembimbing/attendance")
              }
              className="w-fit rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
            >
              Lihat Semua →
            </button>
          </div>

          {/* EMPTY */}
          {!data?.recentAttendances ||
          data.recentAttendances.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
                📋
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                Belum ada data absensi
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Data presensi siswa akan muncul di sini.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Siswa
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Kelas
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Jam Masuk
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.recentAttendances.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                              {item.user.nama
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <p className="font-bold text-slate-700">
                              {item.user.nama}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.user.kelas ? (
                            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                              {item.user.kelas}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {formatTime(item.jamMasuk)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-3 p-4 md:hidden">
                {data.recentAttendances.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                        {item.user.nama
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-bold text-slate-700">
                            {item.user.nama}
                          </p>

                          <span
                            className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span>
                            {item.user.kelas || "-"}
                          </span>

                          <span>•</span>

                          <span>
                            Masuk {formatTime(item.jamMasuk)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Dashboard Pembimbing
          </p>
        </footer>
      </div>
    </main>
  );
}