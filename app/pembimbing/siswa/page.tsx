"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Siswa = {
  id: number;
  nama: string;
  username: string;
  nis: string | null;
  kelas: string | null;
  jurusan: string | null;
  tempatPkl: string | null;
};

export default function DataSiswaPage() {
  const router = useRouter();

  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "PEMBIMBING") {
        router.push("/login");
        return;
      }

      loadSiswa();
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  async function loadSiswa() {
    try {
      setLoading(true);

      const response = await fetch("/api/pembimbing/siswa");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data siswa.");
        return;
      }

      setSiswa(data.data || []);
    } catch (error) {
      console.error("LOAD SISWA ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data siswa.");
    } finally {
      setLoading(false);
    }
  }

  const filteredSiswa = siswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.username.toLowerCase().includes(keyword) ||
      (item.nis || "").toLowerCase().includes(keyword) ||
      (item.kelas || "").toLowerCase().includes(keyword) ||
      (item.jurusan || "").toLowerCase().includes(keyword) ||
      (item.tempatPkl || "").toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Memuat data siswa...
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
              <span className="text-blue-600">Data Siswa</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Data Siswa
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Daftar siswa yang berada dalam bimbingan PKL.
            </p>
          </div>

          <button
            onClick={loadSiswa}
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

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                👨‍🎓 Siswa Bimbingan
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Kelola Data Siswa PKL
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Lihat informasi siswa yang menjadi tanggung jawab
                pembimbing selama pelaksanaan Praktik Kerja Lapangan.
              </p>
            </div>

            <div className="w-fit rounded-[22px] border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-blue-100">
                Total Siswa
              </p>

              <p className="mt-1 text-4xl font-bold">
                {siswa.length}
              </p>

              <p className="mt-1 text-xs text-blue-100">
                siswa terdaftar
              </p>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                👨‍🎓
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Total Siswa
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {siswa.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                🏫
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Tempat PKL
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {new Set(
                    siswa
                      .map((item) => item.tempatPkl)
                      .filter(Boolean)
                  ).size}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                🎓
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Jurusan
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {new Set(
                    siswa
                      .map((item) => item.jurusan)
                      .filter(Boolean)
                  ).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DATA CARD */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">

          {/* CARD HEADER */}
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="font-bold text-slate-800">
                  Daftar Siswa
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredSiswa.length} data ditampilkan
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative w-full lg:max-w-sm">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, NIS, kelas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </div>

          {/* EMPTY */}
          {filteredSiswa.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
                {search ? "🔍" : "👨‍🎓"}
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                {search
                  ? "Siswa tidak ditemukan"
                  : "Belum ada data siswa"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {search
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Data siswa yang menjadi bimbingan akan muncul di sini."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        No
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Siswa
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        NIS
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Kelas
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Jurusan
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tempat PKL
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSiswa.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                              {item.nama
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-slate-700">
                                {item.nama}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                @{item.username}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.nis || "-"}
                        </td>

                        <td className="px-6 py-4">
                          {item.kelas ? (
                            <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                              {item.kelas}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.jurusan || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">🏢</span>

                            <span className="max-w-[180px] truncate text-sm text-slate-600">
                              {item.tempatPkl || "-"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredSiswa.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                        {item.nama
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-700">
                              {item.nama}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              @{item.username}
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-slate-300">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <InfoItem
                            label="NIS"
                            value={item.nis || "-"}
                          />

                          <InfoItem
                            label="Kelas"
                            value={item.kelas || "-"}
                          />

                          <InfoItem
                            label="Jurusan"
                            value={item.jurusan || "-"}
                          />

                          <InfoItem
                            label="Tempat PKL"
                            value={item.tempatPkl || "-"}
                          />
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
            PKL Attendance • Data Siswa Pembimbing
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =========================
   INFO ITEM
========================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-600">
        {value}
      </p>
    </div>
  );
}