"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Announcement = {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminAnnouncementsPage() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // =========================
  // AUTH
  // =========================
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

      getAnnouncements();
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // =========================
  // GET DATA
  // =========================
  const getAnnouncements = async () => {
    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/admin/announcements?userId=${user.id}`
      );

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("API tidak mengembalikan data JSON");
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data pengumuman.");
        return;
      }

      setAnnouncements(data.data || []);
    } catch (error) {
      console.error("GET ADMIN ANNOUNCEMENTS ERROR:", error);

      alert("Terjadi kesalahan saat mengambil data pengumuman.");
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
    setEditingAnnouncement(null);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

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

      if (!judul.trim()) {
        alert("Judul pengumuman wajib diisi.");
        return;
      }

      if (!isi.trim()) {
        alert("Isi pengumuman wajib diisi.");
        return;
      }

      setSaving(true);

      const isEditing = editingAnnouncement !== null;

      const response = await fetch(
        "/api/admin/announcements",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            id: isEditing
              ? editingAnnouncement.id
              : undefined,
            judul: judul.trim(),
            isi: isi.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menyimpan pengumuman."
        );
        return;
      }

      alert(
        isEditing
          ? "Pengumuman berhasil diperbarui. ✨"
          : "Pengumuman berhasil dibuat. 📢"
      );

      resetForm();

      await getAnnouncements();
    } catch (error) {
      console.error(
        "SAVE ADMIN ANNOUNCEMENT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan pengumuman."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (
    announcement: Announcement
  ) => {
    setEditingAnnouncement(announcement);
    setJudul(announcement.judul);
    setIsi(announcement.isi);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (
    announcementId: number
  ) => {
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
        "Apakah kamu yakin ingin menghapus pengumuman ini?"
      );

      if (!yakin) return;

      const response = await fetch(
        `/api/admin/announcements?userId=${user.id}&id=${announcementId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menghapus pengumuman."
        );
        return;
      }

      alert("Pengumuman berhasil dihapus. 🗑️");

      setSelectedAnnouncement(null);

      if (
        editingAnnouncement?.id ===
        announcementId
      ) {
        resetForm();
      }

      await getAnnouncements();
    } catch (error) {
      console.error(
        "DELETE ADMIN ANNOUNCEMENT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus pengumuman."
      );
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatWaktu = (tanggal: string) => {
    return new Date(tanggal).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // SEARCH
  // =========================
  const filteredAnnouncements =
    announcements.filter((announcement) => {
      const keyword = search.toLowerCase();

      return (
        announcement.judul
          .toLowerCase()
          .includes(keyword) ||
        announcement.isi
          .toLowerCase()
          .includes(keyword)
      );
    });

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="font-semibold text-slate-700">
            Memuat data pengumuman...
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
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200"
              title="Kembali ke Dashboard"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Admin Panel
              </p>

              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Pengumuman
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => getAnnouncements()}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================= HERO ================= */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10" />

          <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur">
              📢 Admin • Pengumuman
            </div>

            <h2 className="text-2xl font-bold sm:text-3xl">
              Kelola Informasi Siswa
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Buat, perbarui, dan sampaikan informasi
              penting kepada seluruh siswa PKL melalui
              sistem.
            </p>
          </div>
        </section>

        {/* ================= STATS ================= */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pengumuman
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {announcements.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Seluruh informasi yang tersedia
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📢
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Publikasi Terakhir
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {announcements.length > 0
                    ? formatTanggal(
                        announcements[0].createdAt
                      )
                    : "-"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waktu pengumuman terbaru
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                🕐
              </div>
            </div>
          </div>
        </section>

        {/* ================= FORM ================= */}
        <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg">
                  {editingAnnouncement
                    ? "✏️"
                    : "📝"}
                </span>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    {editingAnnouncement
                      ? "Mode Edit"
                      : "Buat Baru"}
                  </p>

                  <h2 className="text-xl font-bold text-slate-800">
                    {editingAnnouncement
                      ? "Edit Pengumuman"
                      : "Buat Pengumuman"}
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {editingAnnouncement
                  ? "Perbarui informasi pengumuman yang dipilih."
                  : "Tulis informasi yang ingin disampaikan kepada siswa."}
              </p>
            </div>

            {editingAnnouncement && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* JUDUL */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Judul Pengumuman
                </label>

                <span className="text-xs text-slate-400">
                  {judul.length}/200
                </span>
              </div>

              <input
                type="text"
                value={judul}
                onChange={(e) =>
                  setJudul(e.target.value)
                }
                maxLength={200}
                placeholder="Contoh: Jadwal Monitoring PKL"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* ISI */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Isi Pengumuman
                </label>

                <span className="text-xs text-slate-400">
                  {isi.length}/5000
                </span>
              </div>

              <textarea
                value={isi}
                onChange={(e) =>
                  setIsi(e.target.value)
                }
                maxLength={5000}
                rows={7}
                placeholder="Tulis isi pengumuman di sini..."
                className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            {/* BUTTON */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {editingAnnouncement && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-2xl bg-slate-100 px-6 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 font-semibold text-white shadow-md shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : editingAnnouncement
                  ? "💾 Simpan Perubahan"
                  : "📢 Publikasikan Pengumuman"}
              </button>
            </div>
          </form>
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
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari judul atau isi pengumuman..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {search && (
            <p className="mt-3 text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-bold text-slate-700">
                {filteredAnnouncements.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-slate-700">
                {announcements.length}
              </span>{" "}
              pengumuman.
            </p>
          )}
        </section>

        {/* ================= DESKTOP LIST ================= */}
        <section className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm md:block">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Pengumuman
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Kelola informasi yang telah dipublikasikan.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
              {filteredAnnouncements.length} Data
            </div>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                📢
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                Belum ada pengumuman
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Buat pengumuman pertama menggunakan form di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Judul
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Isi
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Dipublikasikan
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAnnouncements.map(
                    (announcement) => (
                      <tr
                        key={announcement.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="max-w-xs px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                              📢
                            </div>

                            <div>
                              <p className="font-bold text-slate-800">
                                {announcement.judul}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID #{announcement.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-md px-5 py-4">
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                            {announcement.isi}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {formatTanggal(
                              announcement.createdAt
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatWaktu(
                              announcement.createdAt
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedAnnouncement(
                                  announcement
                                )
                              }
                              className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Detail
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  announcement
                                )
                              }
                              className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  announcement.id
                                )
                              }
                              className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================= MOBILE LIST ================= */}
        <section className="space-y-4 md:hidden">
          {filteredAnnouncements.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
                📢
              </div>

              <h3 className="mt-5 font-bold text-slate-700">
                Belum ada pengumuman
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Buat pengumuman pertama menggunakan form di atas.
              </p>
            </div>
          ) : (
            filteredAnnouncements.map(
              (announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                      📢
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-800">
                          {announcement.judul}
                        </h3>

                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Info
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatTanggal(
                          announcement.createdAt
                        )}{" "}
                        •{" "}
                        {formatWaktu(
                          announcement.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                      {announcement.isi}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAnnouncement(
                          announcement
                        )
                      }
                      className="rounded-xl bg-blue-50 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(announcement)
                      }
                      className="rounded-xl bg-indigo-50 py-2.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          announcement.id
                        )
                      }
                      className="rounded-xl bg-rose-50 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </section>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedAnnouncement(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  📢
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Detail Pengumuman
                  </p>

                  <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                    Informasi Pengumuman
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAnnouncement(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Judul
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-800">
                  {selectedAnnouncement.judul}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Dipublikasikan
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {formatTanggal(
                      selectedAnnouncement.createdAt
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Waktu
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {formatWaktu(
                      selectedAnnouncement.createdAt
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Isi Pengumuman
                </p>

                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedAnnouncement.isi}
                  </p>
                </div>
              </div>

              {/* MODAL BUTTON */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedAnnouncement(null)
                  }
                  className="flex-1 rounded-2xl bg-slate-800 py-3.5 font-semibold text-white transition hover:bg-slate-900"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const announcement =
                      selectedAnnouncement;

                    setSelectedAnnouncement(null);

                    handleEdit(announcement);
                  }}
                  className="flex-1 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedAnnouncement.id
                    )
                  }
                  className="flex-1 rounded-2xl bg-rose-600 py-3.5 font-semibold text-white transition hover:bg-rose-700"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}