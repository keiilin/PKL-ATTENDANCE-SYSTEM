"use client";

import { useState } from "react";

export default function PembimbingPage() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    {
      name: "Dashboard",
      icon: "⌂",
    },
    {
      name: "Kehadiran Siswa",
      icon: "✓",
    },
    {
      name: "Jurnal Siswa",
      icon: "📝",
    },
    {
      name: "Jadwal PKL",
      icon: "📅",
    },
    {
      name: "Pengumuman",
      icon: "📢",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-xl text-white shadow-md shadow-blue-100">
              🎓
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-800">
                PKL Attendance
              </h1>

              <p className="text-[11px] text-slate-400">
                Pembimbing
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Menu Utama
            </p>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const active = activeMenu === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveMenu(item.name)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100"
                      }`}
                    >
                      {item.icon}
                    </span>

                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                P
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-700">
                  Pembimbing
                </p>

                <p className="text-xs text-slate-400">
                  Akun Pembimbing
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* TOPBAR */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Panel Pembimbing
              </p>

              <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition hover:bg-slate-50">
                🔔
              </button>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-700">
                  Pembimbing
                </p>

                <p className="text-xs text-slate-400">
                  Pendamping PKL
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                P
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="p-5 sm:p-7 lg:p-8">

            {/* HERO */}
            <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-white/5" />

              <div className="relative max-w-3xl">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur-sm">
                  👋 Selamat datang
                </span>

                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                  Dashboard Pembimbing PKL
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Pantau perkembangan, kehadiran, dan kegiatan siswa
                  selama pelaksanaan Praktik Kerja Lapangan dalam satu
                  dashboard.
                </p>
              </div>
            </section>

            {/* STATS */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                icon="👨‍🎓"
                title="Siswa Bimbingan"
                value="0"
                description="Siswa yang dibimbing"
                iconBg="bg-blue-50"
              />

              <StatCard
                icon="✓"
                title="Hadir Hari Ini"
                value="0"
                description="Kehadiran siswa"
                iconBg="bg-emerald-50"
              />

              <StatCard
                icon="⏰"
                title="Terlambat"
                value="0"
                description="Perlu diperhatikan"
                iconBg="bg-amber-50"
              />

              <StatCard
                icon="📝"
                title="Jurnal Hari Ini"
                value="0"
                description="Jurnal yang masuk"
                iconBg="bg-purple-50"
              />
            </div>

            {/* MAIN GRID */}
            <div className="grid gap-6 xl:grid-cols-3">

              {/* KEHADIRAN */}
              <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                      ✓
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Kehadiran Siswa
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Ringkasan kehadiran hari ini
                      </p>
                    </div>
                  </div>

                  <button className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
                    Lihat Semua
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      👨‍🎓
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-700">
                      Data kehadiran belum tersedia
                    </h4>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                      Data siswa bimbingan dan kehadiran akan ditampilkan
                      di bagian ini.
                    </p>
                  </div>
                </div>
              </section>

              {/* QUICK ACTION */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-5">
                  <h3 className="font-bold text-slate-800">
                    Akses Cepat
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Kelola kegiatan pembimbingan
                  </p>
                </div>

                <div className="space-y-3">

                  <QuickAction
                    icon="✓"
                    title="Kehadiran Siswa"
                    description="Pantau presensi"
                    bg="bg-blue-50"
                  />

                  <QuickAction
                    icon="📝"
                    title="Jurnal Siswa"
                    description="Lihat kegiatan siswa"
                    bg="bg-purple-50"
                  />

                  <QuickAction
                    icon="📅"
                    title="Jadwal PKL"
                    description="Lihat jadwal siswa"
                    bg="bg-emerald-50"
                  />

                  <QuickAction
                    icon="📢"
                    title="Pengumuman"
                    description="Informasi PKL"
                    bg="bg-amber-50"
                  />

                </div>
              </section>
            </div>

            {/* BOTTOM */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* JURNAL */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                      📝
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Jurnal Terbaru
                      </h3>

                      <p className="text-xs text-slate-400">
                        Aktivitas siswa
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                    0 DATA
                  </span>
                </div>

                <EmptySmall
                  icon="📝"
                  title="Belum ada jurnal"
                  text="Jurnal siswa akan muncul di sini."
                />
              </section>

              {/* NOTIFICATION */}
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    🔔
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Informasi
                    </h3>

                    <p className="text-xs text-slate-400">
                      Pemberitahuan sistem
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💡</span>

                    <p className="text-xs leading-5 text-amber-700">
                      Gunakan dashboard ini untuk memantau aktivitas
                      siswa bimbingan selama pelaksanaan PKL.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* FOOTER */}
            <footer className="py-8 text-center">
              <p className="text-xs text-slate-400">
                PKL Attendance • Dashboard Pembimbing
              </p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  title,
  value,
  description,
  iconBg,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${iconBg}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-300">
          Hari ini
        </span>
      </div>

      <p className="mt-5 text-xs font-semibold text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-800">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================
   QUICK ACTION
========================= */

function QuickAction({
  icon,
  title,
  description,
  bg,
}: {
  icon: string;
  title: string;
  description: string;
  bg: string;
}) {
  return (
    <button className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-blue-100 hover:bg-slate-50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} text-base`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
        →
      </span>
    </button>
  );
}

/* =========================
   EMPTY SMALL
========================= */

function EmptySmall({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}