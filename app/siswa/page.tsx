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

  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalJournal, setTotalJournal] = useState(0);

  const [journals, setJournals] = useState<Journal[]>([]);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD DASHBOARD
  ========================= */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData: User = JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(userData);
      getDashboard(userData.id);
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

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
        dashboard.schedule || null
      );
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan saat mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FORMAT
  ========================= */

  const formatJam = (
    jam: string | null
  ) => {
    if (!jam) return "-";

    return new Date(jam).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatTanggal = (
    tanggal: string
  ) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";

    return "Selamat malam";
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  /* =========================
     LOADING
  ========================= */

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-3xl">
            ✦
          </div>

          <h2 className="mt-5 font-bold text-slate-800">
            Memuat dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Tunggu sebentar ya...
          </p>

          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-500" />
          </div>

        </div>
      </main>
    );
  }

  const sudahMasuk = !!attendance?.jamMasuk;
  const sudahPulang = !!attendance?.jamPulang;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8fc]">

      <div className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8">

        {/* =========================
            WELCOME HERO
        ========================= */}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">

          {/* dekorasi */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-cyan-300/10" />

          <div className="pointer-events-none absolute -left-16 bottom-[-80px] h-44 w-44 rounded-full bg-white/10" />

          <div className="pointer-events-none absolute right-8 top-7 text-2xl opacity-60">
            ✦
          </div>

          <div className="pointer-events-none absolute right-20 top-16 text-sm opacity-40">
            ✦
          </div>

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                <span>✨</span>
                PORTAL SISWA PKL
              </div>

              <p className="text-sm font-medium text-blue-100">
                {getGreeting()} 👋
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {user.nama}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Pantau presensi, jadwal, jurnal, dan
                informasi PKL kamu dari satu dashboard.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                {user.kelas && (
                  <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                    🎓 {user.kelas}
                  </span>
                )}

                {user.jurusan && (
                  <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                    💻 {user.jurusan}
                  </span>
                )}

                {user.tempatPkl && (
                  <span className="max-w-full truncate rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                    🏢 {user.tempatPkl}
                  </span>
                )}

              </div>

            </div>


            {/* status hari ini */}

            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:min-w-[245px]">

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Status Hari Ini
              </p>

              <div className="mt-3 flex items-center gap-3">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    sudahPulang
                      ? "bg-emerald-400/20"
                      : sudahMasuk
                      ? "bg-white/20"
                      : "bg-amber-300/20"
                  }`}
                >
                  {sudahPulang
                    ? "✓"
                    : sudahMasuk
                    ? "⏱️"
                    : "!"}
                </div>

                <div>
                  <p className="font-bold">
                    {sudahPulang
                      ? "Presensi Selesai"
                      : sudahMasuk
                      ? "Sedang PKL"
                      : "Belum Absen"}
                  </p>

                  <p className="mt-0.5 text-xs text-blue-100">
                    {getTodayName()}, {formatTanggal(new Date().toISOString())}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =========================
            QUICK ACTION
        ========================= */}

        <section className="mt-6">

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Akses Cepat
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Mau melakukan apa?
            </h2>
          </div>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* ABSENSI */}

            <button
              onClick={() => router.push("/absensi")}
              className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100"
            >

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl transition group-hover:scale-110">
                  📸
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  Presensi
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Absen masuk dan pulang PKL
                </p>

                <div className="mt-4 text-sm font-bold text-emerald-600">
                  Buka Presensi →
                </div>

              </div>

            </button>


            {/* JURNAL */}

            <button
              onClick={() => router.push("/jurnal")}
              className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100"
            >

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl transition group-hover:scale-110">
                  📖
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  Jurnal PKL
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Catat kegiatan PKL harian
                </p>

                <div className="mt-4 text-sm font-bold text-purple-600">
                  Buka Jurnal →
                </div>

              </div>

            </button>


            {/* RIWAYAT */}

            <button
              onClick={() => router.push("/history")}
              className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
            >

              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition group-hover:scale-150" />

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl transition group-hover:scale-110">
                  📊
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  Riwayat
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Lihat riwayat presensi
                </p>

                <div className="mt-4 text-sm font-bold text-blue-600">
                  Lihat Riwayat →
                </div>

              </div>

            </button>

          </div>
        </section>


        {/* =========================
            STATISTIK
        ========================= */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">

          {/* KEHADIRAN */}

          <div className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Kehadiran
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {totalAttendance}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                ✓
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Hari tercatat
            </p>

          </div>


          {/* JURNAL */}

          <div className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Jurnal
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {totalJournal}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                📖
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Kegiatan tercatat
            </p>

          </div>


          {/* HARI */}

          <div className="col-span-2 rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm lg:col-span-1">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Hari Ini
                </p>

                <p className="mt-2 text-xl font-bold text-blue-600">
                  {getTodayName()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                🗓️
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              {formatTanggal(new Date().toISOString())}
            </p>

          </div>

        </section>


        {/* =========================
            PRESENSI + JADWAL
        ========================= */}

        <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* PRESENSI */}

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Kehadiran
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Presensi Hari Ini
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Status kehadiran kamu hari ini
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                📋
              </div>

            </div>


            {!attendance ? (

              <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🕐
                </div>

                <h3 className="mt-4 font-bold text-slate-700">
                  Belum melakukan presensi
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Silakan lakukan presensi masuk terlebih dahulu.
                </p>

                <button
                  onClick={() => router.push("/absensi")}
                  className="mt-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5"
                >
                  Absen Sekarang →
                </button>

              </div>

            ) : (

              <div className="mt-6 space-y-4">

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
                    {sudahPulang ? "✓" : "⏱️"}
                  </div>

                </div>


                {/* JAM */}

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Jam Masuk
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-600">
                      {formatJam(attendance.jamMasuk)}
                    </p>

                  </div>


                  <div className="rounded-2xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Jam Pulang
                    </p>

                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {formatJam(attendance.jamPulang)}
                    </p>

                  </div>

                </div>


                {/* ALASAN TERLAMBAT */}

                {attendance.alasanTerlambat && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">

                    <p className="text-xs font-bold text-amber-700">
                      ⚠️ Alasan Terlambat
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      {attendance.alasanTerlambat}
                    </p>

                  </div>
                )}


                {/* ALASAN PULANG TELAT */}

                {attendance.alasanPulangTelat && (
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">

                    <p className="text-xs font-bold text-orange-700">
                      🕐 Alasan Pulang Telat
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-orange-800">
                      {attendance.alasanPulangTelat}
                    </p>

                  </div>
                )}


                <button
                  onClick={() => router.push("/absensi")}
                  className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Buka Halaman Presensi →
                </button>

              </div>
            )}

          </div>


          {/* JADWAL */}

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Jadwal
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Jadwal Hari Ini
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Jadwal PKL kamu
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                ⏰
              </div>

            </div>


            {!schedule ? (

              <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  🗓️
                </div>

                <h3 className="mt-4 font-bold text-slate-700">
                  Belum ada jadwal
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Jadwal untuk hari ini belum tersedia.
                </p>

              </div>

            ) : (

              <div className="mt-6 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-5">

                <div className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                  📅 {schedule.hari}
                </div>

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

                <button
                  onClick={() => router.push("/schedule")}
                  className="mt-4 w-full rounded-xl border border-blue-100 bg-white py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Lihat Jadwal Lengkap →
                </button>

              </div>

            )}

          </div>

        </section>


        {/* =========================
            JURNAL + PENGUMUMAN
        ========================= */}

        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* JURNAL */}

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Aktivitas
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Jurnal Terbaru
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Kegiatan PKL terbaru
                </p>

              </div>

              <button
                onClick={() => router.push("/jurnal")}
                className="rounded-xl px-3 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
              >
                Semua →
              </button>

            </div>


            {journals.length === 0 ? (

              <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  📖
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  Belum ada jurnal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada kegiatan yang dicatat.
                </p>

                <button
                  onClick={() => router.push("/jurnal")}
                  className="mt-4 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
                >
                  Buat Jurnal
                </button>

              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {journals.map((journal) => (

                  <div
                    key={journal.id}
                    className="group rounded-2xl border border-slate-100 p-4 transition hover:border-purple-100 hover:bg-purple-50/40"
                  >

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-lg">
                        📖
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                          <p className="font-bold text-slate-800">
                            {journal.kegiatan}
                          </p>

                          <span className="shrink-0 text-xs text-slate-400">
                            {formatTanggal(journal.tanggal)}
                          </span>

                        </div>

                        {journal.kendala && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            <span className="font-semibold text-slate-600">
                              Kendala:
                            </span>{" "}
                            {journal.kendala}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* PENGUMUMAN */}

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  Informasi
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  Pengumuman
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi terbaru dari sekolah
                </p>

              </div>

              <button
                onClick={() => router.push("/pengumuman")}
                className="rounded-xl px-3 py-2 text-sm font-bold text-rose-500 transition hover:bg-rose-50"
              >
                Semua →
              </button>

            </div>


            {announcements.length === 0 ? (

              <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-7 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                  📢
                </div>

                <p className="mt-4 font-bold text-slate-700">
                  Belum ada pengumuman
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada informasi terbaru.
                </p>

              </div>

            ) : (

              <div className="mt-5 space-y-3">

                {announcements.map((announcement) => (

                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-slate-100 p-4 transition hover:border-rose-100 hover:bg-rose-50/30"
                  >

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-lg">
                        📢
                      </div>

                      <div className="min-w-0 flex-1">

                        <h3 className="font-bold text-slate-800">
                          {announcement.judul}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
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

                ))}

              </div>

            )}

          </div>

        </section>


        {/* =========================
            FOOTER
        ========================= */}

        <footer className="mt-8 pb-4 text-center">

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