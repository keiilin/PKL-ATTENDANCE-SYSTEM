"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username?: string;
  nis?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
};

type Journal = {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
  user: User;
};

export default function PembimbingJurnalPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJournal, setSelectedJournal] =
    useState<Journal | null>(null);

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

  async function getJournals() {
    try {
      setLoading(true);

      const response = await fetch("/api/pembimbing/jurnal");
      const data = await response.json();

      if (response.ok) {
        setJournals(data.data || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("GET JURNALS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      getJournals();
    }
  }, [user]);

  const filteredJournals = journals.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.user.nama.toLowerCase().includes(keyword) ||
      (item.user.kelas || "").toLowerCase().includes(keyword) ||
      (item.user.jurusan || "").toLowerCase().includes(keyword) ||
      item.kegiatan.toLowerCase().includes(keyword) ||
      (item.kendala || "").toLowerCase().includes(keyword)
    );
  });

  const totalSiswa = new Set(
    journals.map((item) => item.user.id)
  ).size;

  const totalDenganKendala = journals.filter(
    (item) => item.kendala?.trim()
  ).length;

  function formatTanggal(tanggal: string) {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Memuat jurnal siswa...
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
              <span className="text-blue-600">
                Jurnal Siswa
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Jurnal Kegiatan Siswa
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Pantau kegiatan harian siswa selama pelaksanaan PKL.
            </p>
          </div>

          <button
            onClick={getJournals}
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
                📝 Aktivitas Siswa
              </span>

              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Pantau Jurnal PKL
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Lihat kegiatan dan kendala yang dicatat siswa
                selama menjalankan Praktik Kerja Lapangan.
              </p>
            </div>

            <div className="w-fit rounded-[22px] border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-sm">
              <p className="text-xs font-medium text-blue-100">
                Total Jurnal
              </p>

              <p className="mt-1 text-4xl font-bold">
                {journals.length}
              </p>

              <p className="mt-1 text-xs text-blue-100">
                jurnal tercatat
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                📝
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Total Jurnal
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {journals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                👨‍🎓
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Siswa Aktif
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {totalSiswa}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg">
                ⚠️
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Ada Kendala
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {totalDenganKendala}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* JOURNAL LIST */}
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">

          {/* HEADER */}
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="font-bold text-slate-800">
                  Daftar Jurnal
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {filteredJournals.length} jurnal ditampilkan
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
                  placeholder="Cari siswa atau kegiatan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          </div>

          {/* EMPTY */}
          {filteredJournals.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
                {search ? "🔍" : "📝"}
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                {search
                  ? "Jurnal tidak ditemukan"
                  : "Belum ada jurnal"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {search
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Jurnal kegiatan siswa akan muncul di sini."}
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        No
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Siswa
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Tanggal
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Kegiatan
                      </th>

                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Kendala
                      </th>

                      <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Detail
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredJournals.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        {/* NO */}
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                          {index + 1}
                        </td>

                        {/* SISWA */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                              {item.user.nama
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-slate-700">
                                {item.user.nama}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.user.kelas || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TANGGAL */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              📅
                            </span>

                            <span className="whitespace-nowrap text-sm text-slate-600">
                              {formatTanggal(item.tanggal)}
                            </span>
                          </div>
                        </td>

                        {/* KEGIATAN */}
                        <td className="max-w-md px-6 py-4">
                          <p className="line-clamp-2 text-sm leading-5 text-slate-600">
                            {item.kegiatan}
                          </p>
                        </td>

                        {/* KENDALA */}
                        <td className="max-w-xs px-6 py-4">
                          {item.kendala ? (
                            <span className="inline-flex max-w-full rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium leading-5 text-amber-700">
                              <span className="line-clamp-2">
                                {item.kendala}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                              Tidak ada kendala
                            </span>
                          )}
                        </td>

                        {/* DETAIL */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              setSelectedJournal(item)
                            }
                            className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredJournals.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                        {item.user.nama
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-700">
                              {item.user.nama}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.user.kelas || "-"}
                            </p>
                          </div>

                          <span className="text-xs font-semibold text-slate-300">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                          <span>📅</span>
                          {formatTanggal(item.tanggal)}
                        </div>

                        <div className="mt-3 rounded-xl bg-white p-3">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Kegiatan
                          </p>

                          <p className="text-xs leading-5 text-slate-600">
                            {item.kegiatan}
                          </p>
                        </div>

                        <div className="mt-2">
                          {item.kendala ? (
                            <div className="rounded-xl bg-amber-50 p-3">
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                Kendala
                              </p>

                              <p className="text-xs leading-5 text-amber-700">
                                {item.kendala}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-600">
                              ✓ Tidak ada kendala
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setSelectedJournal(item)
                          }
                          className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                        >
                          Lihat Detail
                        </button>
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
            PKL Attendance • Jurnal Kegiatan Siswa
          </p>
        </footer>
      </div>

      {/* DETAIL MODAL */}
      {selectedJournal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedJournal(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-blue-100">
                    Detail Jurnal
                  </span>

                  <h3 className="mt-1 text-xl font-bold">
                    Jurnal Kegiatan Siswa
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedJournal(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg transition hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}
            <div className="space-y-4 p-6">

              {/* SISWA */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                  {selectedJournal.user.nama
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-bold text-slate-700">
                    {selectedJournal.user.nama}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {selectedJournal.user.kelas || "-"}
                    {selectedJournal.user.jurusan
                      ? ` • ${selectedJournal.user.jurusan}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tanggal
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  📅 {formatTanggal(selectedJournal.tanggal)}
                </p>
              </div>

              {/* ACTIVITY */}
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Kegiatan
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedJournal.kegiatan}
                </p>
              </div>

              {/* PROBLEM */}
              <div
                className={`rounded-2xl p-4 ${
                  selectedJournal.kendala
                    ? "bg-amber-50"
                    : "bg-emerald-50"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedJournal.kendala
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  Kendala
                </p>

                <p
                  className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
                    selectedJournal.kendala
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  {selectedJournal.kendala ||
                    "Tidak ada kendala yang dilaporkan."}
                </p>
              </div>

              <button
                onClick={() => setSelectedJournal(null)}
                className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}