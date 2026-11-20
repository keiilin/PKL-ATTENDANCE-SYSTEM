"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Journal = {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nama: string;
    username: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
  };
};

export default function AdminJournalsPage() {
  const router = useRouter();

  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJournal, setSelectedJournal] =
    useState<Journal | null>(null);

  // ================================
  // CEK LOGIN ADMIN
  // ================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      getJournals();
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  // ================================
  // AMBIL DATA JURNAL
  // ================================

  const getJournals = async () => {
    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch(
        `/api/admin/journals?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data jurnal.");
        return;
      }

      setJournals(data.data || []);
    } catch (error) {
      console.error("GET ADMIN JOURNALS ERROR:", error);

      alert("Terjadi kesalahan saat mengambil data jurnal.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // HAPUS JURNAL
  // ================================

  const handleDelete = async (journalId: number) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const yakin = window.confirm(
        "Apakah kamu yakin ingin menghapus jurnal ini?"
      );

      if (!yakin) return;

      const response = await fetch(
        `/api/admin/journals?userId=${user.id}&id=${journalId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus jurnal.");
        return;
      }

      alert("Jurnal berhasil dihapus. 🗑️");

      setSelectedJournal(null);

      await getJournals();
    } catch (error) {
      console.error("DELETE ADMIN JOURNAL ERROR:", error);

      alert("Terjadi kesalahan saat menghapus jurnal.");
    }
  };

  // ================================
  // FORMAT TANGGAL
  // ================================

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ================================
  // FILTER JURNAL
  // ================================

  const filteredJournals = journals.filter((journal) => {
    const keyword = search.toLowerCase();

    return (
      journal.user.nama.toLowerCase().includes(keyword) ||
      journal.user.username.toLowerCase().includes(keyword) ||
      (journal.user.nis || "").toLowerCase().includes(keyword) ||
      (journal.user.kelas || "").toLowerCase().includes(keyword) ||
      (journal.user.jurusan || "").toLowerCase().includes(keyword) ||
      (journal.user.tempatPkl || "")
        .toLowerCase()
        .includes(keyword) ||
      journal.kegiatan.toLowerCase().includes(keyword) ||
      (journal.kendala || "").toLowerCase().includes(keyword)
    );
  });

  const jumlahSiswa = new Set(
    journals.map((journal) => journal.user.id)
  ).size;

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />

          <p className="font-semibold text-slate-700">
            Memuat data jurnal...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Tunggu sebentar yaa
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200"
              title="Kembali"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Admin Panel
              </p>

              <h1 className="truncate text-xl font-bold text-slate-800 sm:text-2xl">
                Data Jurnal Siswa
              </h1>
            </div>
          </div>

          <button
            onClick={getJournals}
            className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            ↻ <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================= HERO ================= */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-indigo-100 sm:p-8">
          {/* Dekorasi */}

          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />

          <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
              📖
            </div>

            <p className="text-sm font-medium text-white/75">
              Dokumentasi kegiatan PKL
            </p>

            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Jurnal Kegiatan Siswa
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Pantau jurnal kegiatan yang dibuat siswa selama
              melaksanakan Praktik Kerja Lapangan.
            </p>
          </div>
        </section>

        {/* ================= STATISTIK ================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* TOTAL */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Jurnal
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {journals.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Seluruh jurnal siswa
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                📚
              </div>
            </div>
          </div>

          {/* SISWA */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Siswa dengan Jurnal
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {jumlahSiswa}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Siswa yang sudah membuat jurnal
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                🎓
              </div>
            </div>
          </div>
        </section>

        {/* ================= SEARCH ================= */}

        <section className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa, NIS, kelas, tempat PKL, kegiatan..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {search && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-slate-700">
                  {filteredJournals.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-700">
                  {journals.length}
                </span>{" "}
                jurnal
              </p>

              <button
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Bersihkan
              </button>
            </div>
          )}
        </section>

        {/* ================= DESKTOP TABLE ================= */}

        <section className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm md:block">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Jurnal
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Klik detail untuk melihat isi jurnal secara lengkap.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
              {filteredJournals.length} jurnal
            </span>
          </div>

          {filteredJournals.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                📖
              </div>

              <h3 className="mt-4 font-bold text-slate-700">
                Tidak ada jurnal
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Belum terdapat data jurnal yang sesuai.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Siswa
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Kelas
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tanggal
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Kegiatan
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredJournals.map((journal) => (
                    <tr
                      key={journal.id}
                      className="transition hover:bg-indigo-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                            {journal.user.nama
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {journal.user.nama}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              NIS: {journal.user.nis || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {journal.user.kelas || "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {journal.user.jurusan || "-"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                          {formatTanggal(journal.tanggal)}
                        </span>
                      </td>

                      <td className="max-w-sm px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                          {journal.kegiatan}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() =>
                            setSelectedJournal(journal)
                          }
                          className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= MOBILE ================= */}

        <section className="space-y-4 md:hidden">
          {filteredJournals.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                📖
              </div>

              <h3 className="mt-4 font-bold text-slate-700">
                Tidak ada jurnal
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Belum terdapat data jurnal yang sesuai.
              </p>
            </div>
          ) : (
            filteredJournals.map((journal) => (
              <div
                key={journal.id}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                    {journal.user.nama
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-800">
                      {journal.user.nama}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {journal.user.kelas || "-"} •{" "}
                      {journal.user.jurusan || "-"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    Jurnal
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-slate-400">
                      TANGGAL
                    </p>

                    <p className="text-xs font-semibold text-slate-600">
                      {formatTanggal(journal.tanggal)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400">
                      KEGIATAN
                    </p>

                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-700">
                      {journal.kegiatan}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJournal(journal)}
                  className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Lihat Detail
                </button>
              </div>
            ))
          )}
        </section>
      </div>

      {/* ================= MODAL DETAIL ================= */}

      {selectedJournal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedJournal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 p-5 backdrop-blur sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                  Detail Jurnal
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  Jurnal Kegiatan Siswa
                </h2>
              </div>

              <button
                onClick={() => setSelectedJournal(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* DATA SISWA */}

              <div className="rounded-[24px] bg-gradient-to-br from-slate-50 to-indigo-50/50 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                    🎓
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Informasi Siswa
                    </h3>

                    <p className="text-xs text-slate-400">
                      Data siswa pemilik jurnal
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Nama
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.nama}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Username
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      NIS
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.nis || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Kelas
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.kelas || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Jurusan
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.jurusan || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Tempat PKL
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedJournal.user.tempatPkl || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* TANGGAL */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Tanggal Jurnal
                </p>

                <p className="mt-2 font-semibold text-slate-700">
                  📅 {formatTanggal(selectedJournal.tanggal)}
                </p>
              </div>

              {/* KEGIATAN */}

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Kegiatan
                </p>

                <div className="mt-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedJournal.kegiatan}
                  </p>
                </div>
              </div>

              {/* KENDALA */}

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Kendala
                </p>

                <div className="mt-2 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
                  {selectedJournal.kendala ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {selectedJournal.kendala}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      Tidak ada kendala yang dicatat.
                    </p>
                  )}
                </div>
              </div>

              {/* BUTTON */}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setSelectedJournal(null)}
                  className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(selectedJournal.id)
                  }
                  className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white shadow-sm transition hover:bg-rose-600"
                >
                  🗑️ Hapus Jurnal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}