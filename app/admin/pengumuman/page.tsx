"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredUser {
  id: number;
  nama: string;
  username: string;
  role: string;
}

export default function PengumumanAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Announcement | null>(null);

  // =========================
  // CEK ADMIN
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(storedUser);

      if (parsedUser.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }

      setUser(parsedUser);
      getAnnouncements(parsedUser.id);
    } catch (error) {
      console.error("USER DATA ERROR:", error);
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  // =========================
  // GET ANNOUNCEMENTS
  // =========================
  const getAnnouncements = async (userId: number) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/announcements?userId=${userId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data pengumuman."
        );
      }

      setAnnouncements(result.data || []);
    } catch (error) {
      console.error("GET ANNOUNCEMENTS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengumuman."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setJudul("");
    setIsi("");
    setEditingId(null);
    setShowForm(false);
    setMessage("");
    setErrorMessage("");
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) return;

    const cleanJudul = judul.trim();
    const cleanIsi = isi.trim();

    if (!cleanJudul) {
      setErrorMessage("Judul pengumuman wajib diisi.");
      return;
    }

    if (cleanJudul.length < 3) {
      setErrorMessage(
        "Judul pengumuman minimal 3 karakter."
      );
      return;
    }

    if (cleanJudul.length > 200) {
      setErrorMessage(
        "Judul pengumuman maksimal 200 karakter."
      );
      return;
    }

    if (!cleanIsi) {
      setErrorMessage("Isi pengumuman wajib diisi.");
      return;
    }

    if (cleanIsi.length < 5) {
      setErrorMessage(
        "Isi pengumuman minimal 5 karakter."
      );
      return;
    }

    if (cleanIsi.length > 5000) {
      setErrorMessage(
        "Isi pengumuman maksimal 5000 karakter."
      );
      return;
    }

    try {
      setProcessing(true);
      setMessage("");
      setErrorMessage("");

      const isEditing = editingId !== null;

      const response = await fetch(
        "/api/admin/announcements",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  userId: user.id,
                  judul: cleanJudul,
                  isi: cleanIsi,
                }
              : {
                  userId: user.id,
                  judul: cleanJudul,
                  isi: cleanIsi,
                }
          ),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (isEditing
              ? "Gagal memperbarui pengumuman."
              : "Gagal membuat pengumuman.")
        );
      }

      setMessage(
        result.message ||
          (isEditing
            ? "Pengumuman berhasil diperbarui."
            : "Pengumuman berhasil dibuat.")
      );

      setJudul("");
      setIsi("");
      setEditingId(null);
      setShowForm(false);

      await getAnnouncements(user.id);
    } catch (error) {
      console.error("SAVE ANNOUNCEMENT ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setJudul(announcement.judul);
    setIsi(announcement.isi);

    setShowForm(true);
    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    if (!user || !deleteTarget) return;

    try {
      setProcessing(true);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/announcements?id=${deleteTarget.id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus pengumuman."
        );
      }

      setMessage(
        result.message ||
          "Pengumuman berhasil dihapus."
      );

      setDeleteTarget(null);

      await getAnnouncements(user.id);
    } catch (error) {
      console.error("DELETE ANNOUNCEMENT ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus pengumuman."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-sm text-slate-500">
          Memuat halaman...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <button
              onClick={() => router.push("/admin")}
              className="transition hover:text-blue-600"
            >
              Admin
            </button>

            <span>›</span>

            <span className="font-medium text-slate-700">
              Pengumuman
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                📢 ANNOUNCEMENT MANAGEMENT
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Pengumuman PKL
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                Kelola informasi dan pengumuman yang akan
                ditampilkan kepada siswa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                  setMessage("");
                  setErrorMessage("");
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {showForm
                ? "✕ Tutup Form"
                : "＋ Tambah Pengumuman"}
            </button>
          </div>
        </div>

        {/* ================= MESSAGE ================= */}
        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold">
              ✓
            </div>

            <div>
              <p className="font-bold">Berhasil</p>
              <p className="mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-bold">
              !
            </div>

            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ================= STATISTIK ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pengumuman
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {announcements.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Informasi yang telah dibuat
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📢
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pengumuman Terbaru
                </p>

                <p className="mt-1 text-base font-bold text-slate-800">
                  {announcements.length > 0
                    ? formatDate(
                        announcements[0].createdAt
                      )
                    : "Belum ada"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waktu publikasi terbaru
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                🕒
              </div>
            </div>
          </div>
        </div>

        {/* ================= FORM ================= */}
        {showForm && (
          <section className="mb-6 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-5 text-white md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl">
                  {editingId !== null ? "✏️" : "📢"}
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    {editingId !== null
                      ? "Edit Pengumuman"
                      : "Tambah Pengumuman"}
                  </h2>

                  <p className="text-sm text-blue-100">
                    {editingId !== null
                      ? "Perbarui informasi pengumuman."
                      : "Buat informasi baru untuk siswa."}
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 md:p-6"
            >
              {/* JUDUL */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="judul"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Judul Pengumuman
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    {judul.length}/200
                  </span>
                </div>

                <input
                  id="judul"
                  type="text"
                  value={judul}
                  onChange={(e) =>
                    setJudul(e.target.value)
                  }
                  placeholder="Contoh: Jadwal Monitoring PKL"
                  maxLength={200}
                  disabled={processing}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                />
              </div>

              {/* ISI */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="isi"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Isi Pengumuman
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    {isi.length}/5000
                  </span>
                </div>

                <textarea
                  id="isi"
                  value={isi}
                  onChange={(e) =>
                    setIsi(e.target.value)
                  }
                  placeholder="Tulis isi pengumuman di sini..."
                  maxLength={5000}
                  rows={8}
                  disabled={processing}
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100"
                />
              </div>

              {/* BUTTON */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={processing}
                  className="rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing
                    ? "⏳ Menyimpan..."
                    : editingId !== null
                    ? "💾 Simpan Perubahan"
                    : "📢 Publikasikan Pengumuman"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ================= LIST ================= */}
        <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Daftar Pengumuman
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    {announcements.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Semua pengumuman yang telah dibuat oleh admin.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  user && getAnnouncements(user.id)
                }
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              </div>

              <p className="font-semibold text-slate-700">
                Memuat pengumuman...
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : announcements.length === 0 ? (
            /* EMPTY */
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                📢
              </div>

              <h3 className="font-bold text-slate-700">
                Belum ada pengumuman
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                Belum ada pengumuman yang dibuat. Klik tombol
                &quot;Tambah Pengumuman&quot; untuk membuat
                informasi baru.
              </p>
            </div>
          ) : (
            /* LIST */
            <div className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="p-5 transition hover:bg-blue-50/20 md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                          📢 Pengumuman
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                          {formatDateTime(
                            announcement.createdAt
                          )}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 md:text-xl">
                        {announcement.judul}
                      </h3>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                          {announcement.isi}
                        </p>
                      </div>

                      {announcement.updatedAt !==
                        announcement.createdAt && (
                        <p className="mt-3 text-xs text-slate-400">
                          Terakhir diperbarui:{" "}
                          {formatDateTime(
                            announcement.updatedAt
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2 lg:pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(announcement)
                        }
                        disabled={processing}
                        className="flex-1 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(announcement)
                        }
                        disabled={processing}
                        className="flex-1 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ================= INFO ================= */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
          <div className="text-lg">💡</div>

          <div>
            <p className="text-sm font-bold text-indigo-800">
              Informasi Pengumuman
            </p>

            <p className="mt-1 text-xs leading-relaxed text-indigo-700">
              Pengumuman yang dibuat di halaman ini akan dapat
              dilihat oleh siswa melalui halaman Pengumuman.
              Gunakan judul yang singkat dan isi yang jelas agar
              informasi mudah dipahami.
            </p>
          </div>
        </div>
      </div>

      {/* ================= DELETE MODAL ================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-rose-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                  ⚠️
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Hapus Pengumuman?
                  </h2>

                  <p className="text-sm text-rose-100">
                    Tindakan ini akan menghapus data.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm leading-6 text-slate-500">
                Pengumuman berikut akan dihapus:
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-800">
                  {deleteTarget.judul}
                </p>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                  {deleteTarget.isi}
                </p>
              </div>

              <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                ⚠️ Pengumuman yang sudah dihapus tidak dapat
                dikembalikan.
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={processing}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={processing}
                  className="rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 font-semibold text-white shadow-md shadow-rose-100 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing
                    ? "⏳ Menghapus..."
                    : "🗑️ Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}