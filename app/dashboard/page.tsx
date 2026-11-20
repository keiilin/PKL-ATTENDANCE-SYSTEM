"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
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
  alasanTerlambat: string | null;
  alasanPulangTelat: string | null;
  fotoMasuk: string | null;
  fotoPulang: string | null;
};

type Journal = {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
};

type Announcement = {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
};

type Schedule = {
  hari: string;
  jamMasuk: string;
  jamPulang: string;
};

export default function SiswaPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);

  const [totalAttendance, setTotalAttendance] =
    useState(0);

  const [totalJournal, setTotalJournal] =
    useState(0);

  const [journals, setJournals] =
    useState<Journal[]>([]);

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData: User =
        JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(userData);
      getDashboard(userData.id);
    } catch (error) {
      console.error("LOAD USER ERROR:", error);
      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // GET DASHBOARD
  // =====================================================

  const getDashboard = async (userId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/dashboard?userId=${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil data dashboard"
        );
        return;
      }

      const dashboard = data.data;

      setAttendance(
        dashboard.attendanceToday || null
      );

      setTotalAttendance(
        dashboard.totalAttendance || 0
      );

      setTotalJournal(
        dashboard.totalJournal || 0
      );

      setJournals(
        dashboard.journals || []
      );

      setAnnouncements(
        dashboard.announcements || []
      );

      setSchedule(
        dashboard.todaySchedule || null
      );
    } catch (error) {
      console.error(
        "GET DASHBOARD ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT JAM
  // =====================================================

  const formatJam = (jam: string | null) => {
    if (!jam) return "-";

    return new Date(jam).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // NAMA HARI
  // =====================================================

  const getTodayName = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    return days[new Date().getDay()];
  };

  // =====================================================
  // GREETING
  // =====================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";

    return "Selamat malam";
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">

        <div className="text-center">

          <div className="relative mx-auto mb-5 h-16 w-16">

            <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-100 opacity-60" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">
              ✦
            </div>

          </div>

          <p className="font-semibold text-slate-700">
            Memuat dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Tunggu sebentar ya
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fc]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/20">
              ✦
            </div>

            <div>
              <h1 className="font-bold text-slate-800">
                PKL Attendance
              </h1>

              <p className="text-xs text-slate-400">
                Dashboard Siswa
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
          >
            <span className="hidden sm:inline">
              ↪ Keluar
            </span>

            <span className="sm:hidden">
              ↪
            </span>
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-8 md:py-8">

        {/* =================================================
            WELCOME HERO
        ================================================= */}

        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/10 md:p-8">

          {/* Decorative Circle */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 -right-8 h-64 w-64 rounded-full bg-white/10" />

          <div className="absolute left-1/2 top-0 h-32 w-32 rounded-full bg-purple-400/10 blur-2xl" />

          {/* Sakura */}
          <div className="pointer-events-none absolute right-8 top-6 text-3xl opacity-80">
            🌸
          </div>

          <div className="pointer-events-none absolute right-20 top-20 text-xl opacity-60">
            🌸
          </div>

          <div className="pointer-events-none absolute right-40 bottom-8 text-2xl opacity-50">
            ✿
          </div>

          <div className="pointer-events-none absolute right-12 bottom-16 text-lg opacity-50">
            ✿
          </div>

          <div className="relative z-10">

            <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              ✨ Portal Siswa PKL
            </div>

            <p className="text-sm text-blue-100">
              {getGreeting()} 👋
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              {user.nama}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100 md:text-base">
              Pantau presensi, jurnal, jadwal,
              dan informasi PKL kamu melalui
              satu dashboard.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              {user.kelas && (
                <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  🎓 {user.kelas}
                </span>
              )}

              {user.jurusan && (
                <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  💻 {user.jurusan}
                </span>
              )}

              {user.tempatPkl && (
                <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  🏢 {user.tempatPkl}
                </span>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACTION
        ================================================= */}

        <section className="mb-7">

          <div className="mb-4">

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
              Menu Utama
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Akses Cepat
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* PRESENSI */}

            <button
              onClick={() =>
                router.push("/absensi")
              }
              className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl transition group-hover:scale-110">
                📸
              </div>

              <h3 className="font-bold text-slate-800">
                Presensi
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Absen masuk dan pulang PKL
              </p>

              <p className="mt-4 text-sm font-semibold text-emerald-600">
                Buka Presensi →
              </p>

            </button>

            {/* JURNAL */}

            <button
              onClick={() =>
                router.push("/jurnal")
              }
              className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl transition group-hover:scale-110">
                📖
              </div>

              <h3 className="font-bold text-slate-800">
                Jurnal PKL
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Catat kegiatan PKL harian
              </p>

              <p className="mt-4 text-sm font-semibold text-purple-600">
                Buka Jurnal →
              </p>

            </button>

            {/* RIWAYAT */}

            <button
              onClick={() =>
                router.push("/history")
              }
              className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl transition group-hover:scale-110">
                📊
              </div>

              <h3 className="font-bold text-slate-800">
                Riwayat
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Lihat riwayat presensi
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-600">
                Lihat Riwayat →
              </p>

            </button>

            {/* IZIN */}

            <button
              onClick={() =>
                router.push("/izin")
              }
              className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
            >

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl transition group-hover:scale-110">
                📝
              </div>

              <h3 className="font-bold text-slate-800">
                Izin / Sakit
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Ajukan izin atau sakit
              </p>

              <p className="mt-4 text-sm font-semibold text-amber-600">
                Ajukan Izin →
              </p>

            </button>

          </div>

        </section>

        {/* =================================================
            STATISTIK
        ================================================= */}

        <section className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-3">

          {/* KEHADIRAN */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kehadiran
                </p>

                <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                  {totalAttendance}
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                ✓
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Hari tercatat
            </p>

          </div>

          {/* JURNAL */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jurnal
                </p>

                <h3 className="mt-2 text-3xl font-bold text-purple-600">
                  {totalJournal}
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                📖
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Kegiatan tercatat
            </p>

          </div>

          {/* HARI */}

          <div className="col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-1">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hari Ini
                </p>

                <h3 className="mt-2 text-xl font-bold text-blue-600">
                  {getTodayName()}
                </h3>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                🗓️
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              {formatTanggal(
                new Date().toISOString()
              )}
            </p>

          </div>

        </section>

        {/* =================================================
            PRESENSI + JADWAL
        ================================================= */}

        <section className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* PRESENSI */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Kehadiran
                </p>

                <h2 className="mt-1 font-bold text-slate-800">
                  Presensi Hari Ini
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Status kehadiran kamu hari ini
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                📋
              </div>

            </div>

            {!attendance ? (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🕐
                </div>

                <p className="font-bold text-slate-700">
                  Belum melakukan presensi
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Silakan lakukan presensi masuk.
                </p>

                <button
                  onClick={() =>
                    router.push("/absensi")
                  }
                  className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5"
                >
                  Absen Sekarang →
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                {/* STATUS */}

                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">

                  <div>

                    <p className="text-xs text-slate-500">
                      Status
                    </p>

                    <p className="mt-1 font-bold text-emerald-700">
                      {attendance.status}
                    </p>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    ✅
                  </div>

                </div>

                {/* JAM */}

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Jam Masuk
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-600">
                      {formatJam(
                        attendance.jamMasuk
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Jam Pulang
                    </p>

                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {formatJam(
                        attendance.jamPulang
                      )}
                    </p>

                  </div>

                </div>

                {/* ALASAN TERLAMBAT */}

                {attendance.alasanTerlambat && (
                  <div className="rounded-xl bg-amber-50 p-4">

                    <p className="text-xs font-semibold text-amber-700">
                      Alasan Terlambat
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      {attendance.alasanTerlambat}
                    </p>

                  </div>
                )}

                {/* ALASAN PULANG TELAT */}

                {attendance.alasanPulangTelat && (
                  <div className="rounded-xl bg-orange-50 p-4">

                    <p className="text-xs font-semibold text-orange-700">
                      Alasan Pulang Telat
                    </p>

                    <p className="mt-1 text-sm text-orange-800">
                      {attendance.alasanPulangTelat}
                    </p>

                  </div>
                )}

                <button
                  onClick={() =>
                    router.push("/absensi")
                  }
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Buka Halaman Presensi →
                </button>

              </div>

            )}

          </div>

          {/* JADWAL */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Jadwal
                </p>

                <h2 className="mt-1 font-bold text-slate-800">
                  Jadwal Hari Ini
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Jadwal PKL kamu
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                🗓️
              </div>

            </div>

            {!schedule ? (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🗓️
                </div>

                <p className="font-bold text-slate-700">
                  Belum ada jadwal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Jadwal untuk hari ini belum tersedia.
                </p>

              </div>

            ) : (

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6">

                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100/60" />

                <div className="relative">

                  <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                    📅 {schedule.hari}
                  </span>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <p className="text-xs text-slate-500">
                        Jam Masuk
                      </p>

                      <p className="mt-2 text-xl font-bold text-emerald-600">
                        {schedule.jamMasuk}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">

                      <p className="text-xs text-slate-500">
                        Jam Pulang
                      </p>

                      <p className="mt-2 text-xl font-bold text-blue-600">
                        {schedule.jamPulang}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            JURNAL + PENGUMUMAN
        ================================================= */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* JURNAL */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Aktivitas
                </p>

                <h2 className="mt-1 font-bold text-slate-800">
                  Jurnal Terbaru
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Kegiatan PKL terbaru
                </p>

              </div>

              <button
                onClick={() =>
                  router.push("/jurnal")
                }
                className="rounded-lg px-2 py-1 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
              >
                Semua →
              </button>

            </div>

            {journals.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  📖
                </div>

                <p className="font-semibold text-slate-700">
                  Belum ada jurnal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada kegiatan yang dicatat.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {journals.map(
                  (journal) => (

                    <div
                      key={journal.id}
                      className="group rounded-2xl border border-slate-100 p-4 transition hover:border-purple-100 hover:bg-purple-50/30"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                          📖
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                            <p className="font-semibold text-slate-800">
                              {journal.kegiatan}
                            </p>

                            <span className="text-xs text-slate-400">
                              {formatTanggal(
                                journal.tanggal
                              )}
                            </span>

                          </div>

                          {journal.kendala && (
                            <p className="mt-2 text-sm text-slate-500">
                              <span className="font-medium">
                                Kendala:
                              </span>{" "}
                              {journal.kendala}
                            </p>
                          )}

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* PENGUMUMAN */}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5">

              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Informasi
              </p>

              <h2 className="mt-1 font-bold text-slate-800">
                Pengumuman
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informasi terbaru dari sekolah
              </p>

            </div>

            {announcements.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                  📢
                </div>

                <p className="font-semibold text-slate-700">
                  Belum ada pengumuman
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada informasi terbaru.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {announcements.map(
                  (announcement) => (

                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-slate-100 p-4 transition hover:border-rose-100 hover:bg-rose-50/30"
                    >

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                          📢
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="font-semibold text-slate-800">
                            {announcement.judul}
                          </h3>

                          <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            {announcement.isi}
                          </p>

                          <p className="mt-3 text-xs text-slate-400">
                            {formatTanggal(
                              announcement.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-8 text-center">

          <p className="text-xs font-medium text-slate-400">
            PKL Attendance System
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Semangat menjalani kegiatan PKL ✨
          </p>

        </footer>

      </div>

    </main>
  );
}