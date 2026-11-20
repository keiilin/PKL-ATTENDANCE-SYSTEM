"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const menus = [
  {
    name: "Riwayat Absensi",
    description: "Lihat riwayat kehadiran PKL",
    href: "/history",
    icon: "📋",
    bg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  {
    name: "Pengumuman",
    description: "Informasi terbaru dari sekolah",
    href: "/pengumuman",
    icon: "📢",
    bg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  {
    name: "Profil Saya",
    description: "Lihat dan ubah data akun",
    href: "/profil",
    icon: "👤",
    bg: "bg-indigo-50",
    iconText: "text-indigo-600",
  },
];

export default function MenuPage() {
  const router = useRouter();

  const handleLogout = () => {
    const confirmLogout = confirm(
      "Apakah kamu yakin ingin keluar?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Navigasi</span>
            <span>/</span>
            <span className="text-slate-600 font-medium">
              Menu Lainnya
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Menu Lainnya
          </h1>

          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Akses fitur tambahan untuk mengelola aktivitas PKL kamu.
          </p>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="absolute -right-5 -top-8 text-8xl opacity-15">
            ✨
          </div>

          <div className="absolute right-24 bottom-0 text-6xl opacity-10">
            🌸
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
              <span>🧭</span>
              Navigasi Siswa
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Semua Fitur di Satu Tempat
            </h2>

            <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
              Gunakan menu berikut untuk melihat riwayat absensi,
              membaca pengumuman sekolah, atau mengatur profil akunmu.
            </p>
          </div>
        </section>

        {/* MENU */}
        <div className="space-y-4">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group flex items-center gap-4 sm:gap-5 bg-white border border-slate-100 rounded-[24px] p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
            >
              {/* ICON */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 ${menu.bg} rounded-2xl flex items-center justify-center text-2xl`}
              >
                {menu.icon}
              </div>

              {/* TEXT */}
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-blue-600 transition">
                  {menu.name}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {menu.description}
                </p>
              </div>

              {/* ARROW */}
              <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                →
              </div>
            </Link>
          ))}
        </div>

        {/* INFO */}
        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
              💡
            </div>

            <div>
              <h3 className="font-bold text-blue-900">
                Menu Lainnya
              </h3>

              <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                Dari sini kamu dapat mengakses informasi yang berkaitan
                dengan aktivitas PKL dan akun kamu.
              </p>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="w-full mt-5 flex items-center justify-center gap-2 rounded-[20px] border border-rose-200 bg-white px-5 py-4 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition shadow-sm"
        >
          <span className="text-lg">🚪</span>
          Keluar dari Akun
        </button>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Menu Siswa
          </p>
        </div>
      </div>
    </main>
  );
}