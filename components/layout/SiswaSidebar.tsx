
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const desktopMenus = [
  { name: "Dashboard", href: "/siswa", icon: "🏠" },
  { name: "Absensi", href: "/absensi", icon: "📋" },
  { name: "Riwayat Absensi", href: "/history", icon: "📅" },
  { name: "Jurnal PKL", href: "/jurnal", icon: "📖" },
  { name: "Jadwal PKL", href: "/schedule", icon: "⏰" },
  { name: "Pengumuman", href: "/pengumuman", icon: "📢" },
  { name: "Profil", href: "/profil", icon: "👤" },
  { name: "Izin", href: "/izin", icon: "📝" },
];

const mobileMenus = [
  { name: "Home", href: "/siswa", icon: "🏠" },
  { name: "Absen", href: "/absensi", icon: "📋" },
  { name: "Jurnal", href: "/jurnal", icon: "📖" },
  { name: "Profil", href: "/profil", icon: "👤" },
];

const otherMenus = [
  { name: "Riwayat Absensi", href: "/history", icon: "📅" },
  { name: "Jadwal PKL", href: "/schedule", icon: "⏰" },
  { name: "Pengumuman", href: "/pengumuman", icon: "📢" },
  { name: "Pengajuan Izin", href: "/izin", icon: "📝" },
];

export default function SiswaSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (href: string) => {
    if (href === "/siswa") return pathname === "/siswa";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Apakah kamu yakin ingin keluar dari akun?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-blue-700 text-white flex-col p-5 z-40">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              PKL Attendance
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Portal Siswa SMK Brantas
            </p>
          </div>

          <nav className="space-y-2">
            {desktopMenus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(menu.href)
                    ? "bg-white text-blue-700 shadow"
                    : "hover:bg-blue-600 text-blue-50"
                }`}
              >
                <span className="text-lg">{menu.icon}</span>
                <span>{menu.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-xl transition"
        >
          <span>🚪</span>
          Logout
        </button>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center px-4">
        <div>
          <h1 className="font-bold text-blue-700">
            PKL Attendance
          </h1>
          <p className="text-xs text-gray-500">
            Portal Siswa SMK Brantas
          </p>
        </div>
      </header>

      {/* MOBILE MENU LAINNYA */}
      {showMenu && (
        <>
          <button
            aria-label="Tutup menu"
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMenu(false)}
          />

          <div className="md:hidden fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl z-50 p-4">
            <h3 className="font-bold text-lg mb-3">
              Menu Lainnya
            </h3>

            <div className="space-y-1">
              {otherMenus.map((menu) => (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    isActive(menu.href)
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xl">{menu.icon}</span>
                  <span>{menu.name}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-3 rounded-xl text-red-600 hover:bg-red-50"
              >
                <span className="text-xl">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t z-50">
        <div className="grid grid-cols-5 h-full">
          {mobileMenus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive(menu.href)
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              <span className="text-xl">{menu.icon}</span>
              <span className="text-[11px]">{menu.name}</span>
            </Link>
          ))}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex flex-col items-center justify-center gap-1 ${
              showMenu ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">☰</span>
            <span className="text-[11px]">Lainnya</span>
          </button>
        </div>
      </nav>
    </>
  );
}
