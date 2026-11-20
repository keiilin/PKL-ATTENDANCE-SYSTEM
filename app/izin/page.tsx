"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  aktif?: boolean;
};

type LeaveRequest = {
  id: number;
  userId: number;
  tanggal: string;
  status: string;
  alasan: string;
  statusPengajuan: string;
  catatanAdmin: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function IzinPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("IZIN");
  const [alasan, setAlasan] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  const formatTanggal = (value: string) => {
    try {
      return new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const formatTanggalWaktu = (value: string) => {
    try {
      return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("USER SESSION ERROR:", error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      const response = await fetch(
        `/api/leave?userId=${parsedUser.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data pengajuan."
        );
      }

      setRequests(data.data || []);
    } catch (error) {
      console.error("LOAD LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengajuan."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) return;

    setMessage("");
    setMessageType("");

    if (!tanggal) {
      setMessage("Tanggal wajib dipilih.");
      setMessageType("error");
      return;
    }

    if (!alasan.trim()) {
      setMessage("Alasan wajib diisi.");
      setMessageType("error");
      return;
    }

    if (alasan.trim().length < 5) {
      setMessage(
        "Alasan terlalu singkat. Silakan jelaskan lebih lengkap."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          tanggal,
          status,
          alasan: alasan.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengirim pengajuan."
        );
      }

      setMessage(
        data.message || "Pengajuan berhasil dikirim."
      );
      setMessageType("success");

      setTanggal("");
      setStatus("IZIN");
      setAlasan("");

      await loadRequests();
    } catch (error) {
      console.error("SUBMIT LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengirim pengajuan."
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: LeaveRequest) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Batalkan pengajuan ${item.status.toLowerCase()} untuk tanggal ${formatTanggal(
        item.tanggal
      )}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      const response = await fetch(
        `/api/leave?id=${item.id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal membatalkan pengajuan."
        );
      }

      setMessage(
        data.message || "Pengajuan berhasil dibatalkan."
      );
      setMessageType("success");

      await loadRequests();
    } catch (error) {
      console.error("DELETE LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal membatalkan pengajuan."
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (value: string) => {
    if (value === "MENUNGGU") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <span>⏳</span>
          Menunggu
        </span>
      );
    }

    if (value === "DITERIMA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span>✓</span>
          Diterima
        </span>
      );
    }

    if (value === "DITOLAK") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">
          <span>✕</span>
          Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        {value}
      </span>
    );
  };

  const typeBadge = (value: string) => {
    if (value === "SAKIT") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">
          🤒 Sakit
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
        📄 Izin
      </span>
    );
  };

  const totalMenunggu = requests.filter(
    (item) => item.statusPengajuan === "MENUNGGU"
  ).length;

  const totalDiterima = requests.filter(
    (item) => item.statusPengajuan === "DITERIMA"
  ).length;

  const totalDitolak = requests.filter(
    (item) => item.statusPengajuan === "DITOLAK"
  ).length;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl animate-pulse">📝</span>
          </div>

          <p className="text-sm font-medium text-slate-600">
            Memuat halaman...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <button
              onClick={() => router.push("/siswa")}
              className="hover:text-blue-600 transition"
            >
              Dashboard
            </button>

            <span>›</span>

            <span className="text-slate-700 font-medium">
              Izin & Sakit
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Izin & Sakit 📝
              </h1>

              <p className="text-slate-500 mt-1">
                Ajukan izin atau sakit untuk keperluan PKL.
              </p>
            </div>

            <button
              onClick={loadRequests}
              disabled={loading}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition disabled:opacity-50"
            >
              <span>↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 mb-7 shadow-xl shadow-indigo-200/40">
          <div className="absolute -right-10 -top-16 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute right-24 -bottom-28 w-60 h-60 bg-white/10 rounded-full" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 text-white text-xs font-medium mb-4">
              <span>📋</span>
              Pengajuan Kehadiran
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Sampaikan ketidakhadiranmu
            </h2>

            <p className="text-blue-100 mt-2 max-w-2xl text-sm sm:text-base">
              Gunakan halaman ini untuk mengajukan izin atau sakit.
              Pengajuan akan diproses oleh pihak yang berwenang.
            </p>
          </div>
        </section>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3.5 text-sm font-medium ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {messageType === "success" ? "✓" : "⚠️"}
              </span>

              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Pengajuan
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-2">
              {requests.length}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Semua pengajuan
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Menunggu
            </p>

            <p className="text-2xl font-bold text-amber-700 mt-2">
              {totalMenunggu}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Belum diproses
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Diterima
            </p>

            <p className="text-2xl font-bold text-emerald-700 mt-2">
              {totalDiterima}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Pengajuan diterima
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Ditolak
            </p>

            <p className="text-2xl font-bold text-rose-700 mt-2">
              {totalDitolak}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Pengajuan ditolak
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <section className="h-fit bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                  📝
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Buat Pengajuan
                  </h2>

                  <p className="text-sm text-slate-500 mt-0.5">
                    Isi data dengan benar
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >
              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Pilih tanggal kamu tidak dapat mengikuti kegiatan
                  PKL.
                </p>
              </div>

              {/* Jenis */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Jenis Pengajuan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("IZIN")}
                    className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                      status === "IZIN"
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📄 Izin
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("SAKIT")}
                    className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                      status === "SAKIT"
                        ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🤒 Sakit
                  </button>
                </div>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alasan
                </label>

                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={6}
                  placeholder="Jelaskan alasan pengajuan izin atau sakit..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                  <span>Minimal 5 karakter</span>
                  <span>{alasan.length} karakter</span>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Mengirim Pengajuan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    📤 Kirim Pengajuan
                  </span>
                )}
              </button>
            </form>
          </section>

          {/* History */}
          <section className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Riwayat Pengajuan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Daftar pengajuan izin dan sakit kamu.
                </p>
              </div>

              <button
                onClick={loadRequests}
                disabled={loading}
                className="self-start sm:self-auto rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Memuat riwayat...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                  📭
                </div>

                <h3 className="font-bold text-slate-700">
                  Belum ada pengajuan
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Pengajuan izin atau sakit kamu akan muncul di
                  sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4 sm:p-6">
                {requests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 transition hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {typeBadge(item.status)}
                          {statusBadge(item.statusPengajuan)}
                        </div>

                        <h3 className="mt-3 font-bold text-slate-900">
                          {formatTanggal(item.tanggal)}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Diajukan{" "}
                          {formatTanggalWaktu(item.createdAt)}
                        </p>
                      </div>

                      {item.statusPengajuan === "MENUNGGU" && (
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          {deletingId === item.id
                            ? "Membatalkan..."
                            : "Batalkan"}
                        </button>
                      )}
                    </div>

                    {/* Alasan */}
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Alasan
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {item.alasan}
                      </p>
                    </div>

                    {/* Catatan Admin */}
                    {item.catatanAdmin && (
                      <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">💬</span>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                              Catatan Admin
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {item.catatanAdmin}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Info */}
        <section className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="text-xl">💡</div>

            <div>
              <h3 className="font-bold text-blue-900">
                Informasi Pengajuan
              </h3>

              <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                Pengajuan yang masih berstatus <b>Menunggu</b> dapat
                dibatalkan. Setelah diproses oleh admin, status akan
                berubah menjadi Diterima atau Ditolak.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-slate-400">
          PKL Attendance • Izin & Sakit Siswa
        </footer>
      </div>
    </main>
  );
}