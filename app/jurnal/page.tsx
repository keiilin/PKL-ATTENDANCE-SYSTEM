"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nama: string;
  username?: string;
  role: string;
}

interface Journal {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function JurnalPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [kegiatan, setKegiatan] = useState("");
  const [kendala, setKendala] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // ==============================
  // CEK LOGIN
  // ==============================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
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

  // ==============================
  // AMBIL DATA JURNAL
  // ==============================

  const getJournals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/journal?userId=${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setJournals(data.data || []);
      } else {
        alert(data.message || "Gagal mengambil data jurnal");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil jurnal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getJournals();
    }
  }, [user]);

  // ==============================
  // RESET FORM
  // ==============================

  const resetForm = () => {
    setKegiatan("");
    setKendala("");
    setEditingId(null);
    setShowForm(false);
  };

  // ==============================
  // TAMBAH / EDIT JURNAL
  // ==============================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!kegiatan.trim()) {
      alert("Kegiatan wajib diisi");
      return;
    }

    if (kegiatan.trim().length < 5) {
      alert("Kegiatan minimal 5 karakter");
      return;
    }

    if (kegiatan.trim().length > 2000) {
      alert("Kegiatan maksimal 2000 karakter");
      return;
    }

    if (kendala.trim().length > 2000) {
      alert("Kendala maksimal 2000 karakter");
      return;
    }

    if (!user) return;

    try {
      setProcessing(true);

      const isEditing = editingId !== null;

      const response = await fetch("/api/journal", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                id: editingId,
                userId: user.id,
                kegiatan: kegiatan.trim(),
                kendala: kendala.trim(),
              }
            : {
                userId: user.id,
                kegiatan: kegiatan.trim(),
                kendala: kendala.trim(),
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            (isEditing
              ? "Gagal mengubah jurnal"
              : "Gagal menyimpan jurnal")
        );
        return;
      }

      alert(
        data.message ||
          (isEditing
            ? "Jurnal berhasil diubah"
            : "Jurnal berhasil disimpan")
      );

      resetForm();
      await getJournals();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // MULAI EDIT
  // ==============================

  const handleEdit = (journal: Journal) => {
    setEditingId(journal.id);
    setKegiatan(journal.kegiatan);
    setKendala(journal.kendala || "");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // HAPUS JURNAL
  // ==============================

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Apakah kamu yakin ingin menghapus jurnal ini?"
    );

    if (!confirmDelete) return;
    if (!user) return;

    try {
      setProcessing(true);

      const response = await fetch(
        `/api/journal?id=${id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menghapus jurnal"
        );
        return;
      }

      alert(
        data.message || "Jurnal berhasil dihapus"
      );

      await getJournals();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // FORMAT TANGGAL
  // ==============================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==============================
  // FILTER SEARCH
  // ==============================

  const filteredJournals = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return journals;

    return journals.filter((journal) => {
      return (
        journal.kegiatan
          ?.toLowerCase()
          .includes(keyword) ||
        journal.kendala
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [journals, search]);

  // ==============================
  // LOADING
  // ==============================

  if (loading && !user) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg">
            📖
          </div>

          <p className="font-semibold text-slate-700">
            Memuat jurnal...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-16">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <span>Aktivitas PKL</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">
                Jurnal
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Jurnal PKL
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Catat kegiatan dan kendala selama melaksanakan PKL.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-xl transition"
          >
            {showForm ? "✕ Tutup Form" : "+ Tambah Jurnal"}
          </button>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="absolute -right-6 -top-10 text-[100px] opacity-15">
            📖
          </div>

          <div className="absolute right-32 bottom-0 text-7xl opacity-10">
            ✨
          </div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
              <span>📝</span>
              Dokumentasi Aktivitas
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Dokumentasikan Kegiatan PKL-mu
            </h2>

            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              Catat aktivitas harian dan kendala yang kamu alami
              selama melaksanakan Praktik Kerja Lapangan.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5">
              <span className="text-lg">📚</span>
              <span className="text-sm font-semibold">
                {journals.length} jurnal telah dicatat
              </span>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                📖
              </div>

              <span className="text-xs font-semibold text-slate-400">
                TOTAL
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-4">
              {journals.length}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Kegiatan telah dicatat
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                📅
              </div>

              <span className="text-xs font-semibold text-slate-400">
                TERBARU
              </span>
            </div>

            <p className="text-lg sm:text-xl font-bold text-slate-800 mt-4">
              {journals.length > 0
                ? formatShortDate(journals[0].tanggal)
                : "-"}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Catatan jurnal terbaru
            </p>
          </div>
        </div>

        {/* FORM */}
        {showForm && (
          <section className="mb-6 bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      {editingId ? "✏️" : "📝"}
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {editingId
                          ? "Edit Jurnal"
                          : "Tambah Jurnal"}
                      </h2>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingId
                          ? "Perbarui catatan kegiatan PKL kamu."
                          : "Tuliskan kegiatan PKL yang kamu lakukan."}
                      </p>
                    </div>
                  </div>
                </div>

                {editingId && (
                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                    ✏️ Mode Edit
                  </span>
                )}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-6"
            >
              {/* KEGIATAN */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">
                    Kegiatan
                  </label>

                  <span className="text-xs text-slate-400">
                    {kegiatan.length}/2000
                  </span>
                </div>

                <textarea
                  value={kegiatan}
                  onChange={(e) =>
                    setKegiatan(e.target.value)
                  }
                  placeholder="Contoh: Membantu membuat desain halaman dashboard..."
                  maxLength={2000}
                  className="w-full min-h-36 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Jelaskan kegiatan PKL yang kamu lakukan hari ini.
                </p>
              </div>

              {/* KENDALA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">
                    Kendala{" "}
                    <span className="font-normal text-slate-400">
                      (Opsional)
                    </span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {kendala.length}/2000
                  </span>
                </div>

                <textarea
                  value={kendala}
                  onChange={(e) =>
                    setKendala(e.target.value)
                  }
                  placeholder="Tuliskan kendala yang kamu alami selama PKL..."
                  maxLength={2000}
                  className="w-full min-h-28 resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50"
                />

                <p className="text-xs text-slate-400 mt-2">
                  Tidak ada kendala? Bagian ini boleh dikosongkan.
                </p>
              </div>

              {/* BUTTON */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={processing}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-xl transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Jurnal"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* RIWAYAT JURNAL */}
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    📚
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                      Riwayat Jurnal
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Semua aktivitas PKL yang telah kamu catat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Catatan
                </p>

                <p className="text-lg font-bold text-slate-700">
                  {journals.length}
                </p>
              </div>
            </div>

            {/* SEARCH */}
            {journals.length > 0 && (
              <div className="relative mt-5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari kegiatan atau kendala..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl animate-pulse">
                📖
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Memuat jurnal...
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Mengambil data jurnal kamu
              </p>
            </div>
          ) : journals.length === 0 ? (

            /* KOSONG */
            <div className="p-10 sm:p-16 text-center">
              <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-4xl">
                📖
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Belum Ada Jurnal
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Mulai dokumentasikan kegiatan PKL kamu supaya
                aktivitas harianmu tercatat dengan rapi.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:shadow-xl transition"
              >
                + Tambah Jurnal
              </button>
            </div>

          ) : filteredJournals.length === 0 ? (

            /* TIDAK ADA HASIL SEARCH */
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl">
                🔎
              </div>

              <h3 className="font-bold text-slate-700">
                Jurnal tidak ditemukan
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Coba gunakan kata kunci pencarian yang berbeda.
              </p>
            </div>

          ) : (

            /* LIST */
            <div className="divide-y divide-slate-100">
              {filteredJournals.map((journal) => (
                <article
                  key={journal.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3">

                    {/* ICON */}
                    <div className="w-11 h-11 shrink-0 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                      📖
                    </div>

                    <div className="min-w-0 flex-1">

                      {/* TITLE + DATE */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-bold text-slate-800">
                          Jurnal PKL
                        </h3>

                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                          📅 {formatDate(journal.tanggal)}
                        </span>
                      </div>

                      {/* KEGIATAN */}
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-2">
                          Kegiatan
                        </p>

                        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
                          {journal.kegiatan}
                        </p>
                      </div>

                      {/* KENDALA */}
                      {journal.kendala ? (
                        <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                          <div className="flex items-center gap-2">
                            <span>⚠️</span>

                            <p className="text-xs font-bold text-amber-700">
                              Kendala
                            </p>
                          </div>

                          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-amber-900">
                            {journal.kendala}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
                          <span>✓</span>

                          <p className="text-xs font-semibold text-emerald-700">
                            Tidak ada kendala yang dicatat.
                          </p>
                        </div>
                      )}

                      {/* ACTION */}
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            handleEdit(journal)
                          }
                          disabled={processing}
                          className="w-full sm:w-auto rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(journal.id)
                          }
                          disabled={processing}
                          className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition disabled:opacity-50"
                        >
                          🗑️ Hapus
                        </button>
                      </div>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* INFO */}
        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
              💡
            </div>

            <div>
              <h3 className="font-bold text-blue-900">
                Tips Mengisi Jurnal
              </h3>

              <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                Tuliskan kegiatan PKL secara jelas dan sesuai dengan
                aktivitas yang benar-benar kamu lakukan. Jika mengalami
                kendala, kamu dapat mencatatnya pada bagian kendala.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance System
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Dokumentasikan perjalanan PKL-mu dengan rapi ✨
          </p>
        </div>

      </div>
    </main>
  );
}