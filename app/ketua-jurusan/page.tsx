"use client";

import Link from "next/link";

export default function KetuaJurusanPage() {
  
const menus = [
  {
    title: "Data Siswa",
    description: "Melihat data siswa yang sedang melaksanakan PKL.",
    icon: "👨‍🎓",
    href: "#",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Monitoring Absensi",
    description: "Memantau kehadiran siswa selama kegiatan PKL.",
    icon: "📊",
    href: "#",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Jurnal PKL",
    description: "Melihat laporan kegiatan dan jurnal siswa.",
    icon: "📖",
    href: "#",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "Laporan",
    description: "Melihat informasi dan rekap kegiatan PKL.",
    icon: "📋",
    href: "#",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Tempat PKL",
    description:
      "Melihat biodata perusahaan, alamat, kontak, dan daftar siswa di setiap tempat PKL.",
    icon: "🏢",
    href: "/ketua-jurusan/tempat-pkl",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];


  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
              Pantau pelaksanaan PKL siswa dalam satu halaman.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
              👨‍💼
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Login sebagai
              </p>

              <p className="text-sm font-bold text-slate-700">
                Ketua Jurusan
              </p>
            </div>
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 lg:p-10 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="absolute -right-6 -top-10 text-[100px] opacity-15">
            🎓
          </div>

          <div className="absolute right-28 bottom-0 text-7xl opacity-10">
            ✨
          </div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
              <span>🏫</span>
              Sistem Monitoring PKL
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Selamat Datang di Dashboard Ketua Jurusan
            </h2>

            <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Gunakan dashboard ini untuk memantau aktivitas,
              kehadiran, jurnal, dan perkembangan siswa selama
              melaksanakan Praktik Kerja Lapangan.
            </p>
          </div>
        </section>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              👨‍🎓
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              —
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total Siswa PKL
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              ✓
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              —
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Kehadiran Hari Ini
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
              📖
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              —
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Jurnal PKL
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
              🏢
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              —
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Tempat PKL
            </p>
          </div>
        </div>

        {/* MENU */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              Menu Utama
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Akses fitur monitoring PKL dari sini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menus.map((menu) => (
              <Link
                key={menu.title}
                href={menu.href}
                className="group bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-13 h-13 min-w-[52px] rounded-2xl ${menu.color} flex items-center justify-center text-2xl`}
                  >
                    {menu.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                      {menu.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      {menu.description}
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* INFO */}
        <div className="mt-6 rounded-[24px] border border-indigo-100 bg-indigo-50/70 p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
              💡
            </div>

            <div>
              <h3 className="font-bold text-indigo-900">
                Informasi Dashboard
              </h3>

              <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">
                Dashboard ini menjadi pusat monitoring kegiatan PKL
                siswa. Data statistik akan terhubung dengan sistem
                setelah fitur backend Ketua Jurusan dibuat.
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