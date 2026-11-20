"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username?: string;
  role: string;
};

type DashboardData = {
  totalStudents: number;
  totalPembimbing: number;
  attendanceToday: number;
  totalTempatPkl: number;
};

export default function KetuaJurusanDashboard() {
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

  const getDashboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/ketua-jurusan/dashboard"
      );

      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDashboard();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <span className="text-2xl animate-pulse">
              📊
            </span>
          </div>

          <p className="font-semibold text-slate-700">
            Memuat dashboard...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <span>Ketua Jurusan</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">
                Dashboard
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Dashboard Ketua Jurusan
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Selamat datang,{" "}
              <span className="font-semibold text-slate-700">
                {user.nama}
              </span>
            </p>
          </div>

          <button
            onClick={getDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-200 transition"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="absolute -right-5 -top-8 text-[100px] opacity-15">
            🎓
          </div>

          <div className="absolute right-32 bottom-0 text-7xl opacity-10">
            ✨
          </div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
              <span>👋</span>
              Sistem Monitoring PKL
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Selamat Datang di Dashboard
            </h2>

            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              Pantau data siswa, pembimbing, kehadiran, dan tempat PKL
              dalam satu dashboard.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* SISWA */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                👨‍🎓
              </div>

              <span className="text-xs font-semibold text-slate-400">
                SISWA
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              {data?.totalStudents || 0}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total siswa PKL
            </p>
          </div>

          {/* PEMBIMBING */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
                👨‍🏫
              </div>

              <span className="text-xs font-semibold text-slate-400">
                PEMBIMBING
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              {data?.totalPembimbing || 0}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total pembimbing
            </p>
          </div>

          {/* HADIR */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                ✅
              </div>

              <span className="text-xs font-semibold text-slate-400">
                KEHADIRAN
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              {data?.attendanceToday || 0}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Hadir hari ini
            </p>
          </div>

          {/* TEMPAT PKL */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
                🏢
              </div>

              <span className="text-xs font-semibold text-slate-400">
                TEMPAT PKL
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              {data?.totalTempatPkl || 0}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Tempat PKL
            </p>
          </div>
        </div>

        {/* QUICK MENU */}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Menu Utama
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Akses fitur monitoring PKL dengan cepat.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* DATA SISWA */}
            <button
              onClick={() =>
                router.push("/ketua-jurusan/siswa")
              }
              className="group text-left bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                  👨‍🎓
                </div>

                <span className="text-slate-300 group-hover:text-blue-500 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mt-5">
                Data Siswa
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Lihat data siswa yang sedang melaksanakan PKL.
              </p>
            </button>

            {/* TEMPAT PKL */}
            <button
              onClick={() =>
                router.push("/ketua-jurusan/tempat-pkl")
              }
              className="group text-left bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                  🏢
                </div>

                <span className="text-slate-300 group-hover:text-emerald-500 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mt-5">
                Tempat PKL
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Lihat daftar tempat PKL dan jumlah siswa di setiap tempat.
              </p>
            </button>

            {/* MONITORING ABSENSI */}
            <button
              onClick={() =>
                router.push("/ketua-jurusan/attendance")
              }
              className="group text-left bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                  📊
                </div>

                <span className="text-slate-300 group-hover:text-purple-500 transition text-xl">
                  →
                </span>
              </div>

              <h3 className="font-bold text-slate-800 mt-5">
                Monitoring Absensi
              </h3>

              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Pantau data kehadiran siswa selama kegiatan PKL.
              </p>
            </button>

          </div>
        </section>

        {/* RINGKASAN */}
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
              📋
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Ringkasan Monitoring
              </h2>

              <p className="text-sm text-slate-500">
                Gambaran singkat kondisi data PKL saat ini.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">

            <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                Siswa PKL
              </p>

              <p className="text-sm text-blue-800 mt-2 leading-relaxed">
                Terdapat{" "}
                <span className="font-bold">
                  {data?.totalStudents || 0} siswa
                </span>{" "}
                yang tercatat dalam sistem PKL.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
                Kehadiran Hari Ini
              </p>

              <p className="text-sm text-emerald-800 mt-2 leading-relaxed">
                Sebanyak{" "}
                <span className="font-bold">
                  {data?.attendanceToday || 0} siswa
                </span>{" "}
                tercatat hadir hari ini.
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
                Informasi Dashboard
              </h3>

              <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                Dashboard digunakan untuk membantu Ketua Jurusan
                memantau data siswa dan kegiatan PKL secara terpusat.
                Gunakan menu yang tersedia untuk melihat informasi
                secara lebih detail.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Dashboard Ketua Jurusan
          </p>
        </div>

      </div>
    </main>
  );
}