"use client";

import { useEffect, useMemo, useState } from "react";
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
  user: {
    id: number;
    nama: string;
    username: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
    aktif: boolean;
  };
};

export default function AdminIzinPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [filter, setFilter] = useState("SEMUA");
  const [search, setSearch] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequest | null>(null);

  const [showDetail, setShowDetail] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const [catatanAdmin, setCatatanAdmin] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatTanggal = (tanggal: string) => {
    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return tanggal;
    }
  };

  const formatTanggalWaktu = (tanggal: string) => {
    try {
      return new Date(tanggal).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return tanggal;
    }
  };

  // =====================================================
  // CEK LOGIN
  // =====================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "ADMIN") {
        router.push("/");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("USER SESSION ERROR:", error);
      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "ADMIN") {
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/admin/leave?adminId=${parsedUser.id}`,
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

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchesStatus =
        filter === "SEMUA" ||
        item.statusPengajuan === filter;

      const keyword = search.trim().toLowerCase();

      if (!keyword) {
        return matchesStatus;
      }

      const matchesSearch =
        item.user.nama.toLowerCase().includes(keyword) ||
        item.user.username.toLowerCase().includes(keyword) ||
        (item.user.nis || "").toLowerCase().includes(keyword) ||
        (item.user.kelas || "").toLowerCase().includes(keyword) ||
        (item.user.jurusan || "").toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        item.alasan.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [requests, filter, search]);

  // =====================================================
  // STATISTIK
  // =====================================================

  const totalPengajuan = requests.length;

  const totalMenunggu = requests.filter(
    (item) => item.statusPengajuan === "MENUNGGU"
  ).length;

  const totalDiterima = requests.filter(
    (item) => item.statusPengajuan === "DITERIMA"
  ).length;

  const totalDitolak = requests.filter(
    (item) => item.statusPengajuan === "DITOLAK"
  ).length;

  // =====================================================
  // PROSES KEPUTUSAN
  // =====================================================

  const processRequest = async (
    requestId: number,
    keputusan: "DITERIMA" | "DITOLAK",
    catatan: string
  ) => {
    try {
      if (!user) return;

      setProcessing(true);
      setMessage("");

      const response = await fetch("/api/admin/leave", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: user.id,
          id: requestId,
          keputusan,
          catatanAdmin: catatan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal memproses pengajuan."
        );
      }

      setMessage(data.message || "Pengajuan berhasil diproses.");
      setMessageType("success");

      setSelectedRequest(null);
      setShowDetail(false);
      setShowReject(false);
      setCatatanAdmin("");

      await loadRequests();
    } catch (error) {
      console.error("PROCESS LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal memproses pengajuan."
      );

      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // TERIMA
  // =====================================================

  const handleAccept = async (item: LeaveRequest) => {
    const confirmed = window.confirm(
      `Terima pengajuan ${item.status.toLowerCase()} dari ${item.user.nama} untuk tanggal ${formatTanggal(
        item.tanggal
      )}?`
    );

    if (!confirmed) return;

    await processRequest(item.id, "DITERIMA", "");
  };

  // =====================================================
  // TOLAK
  // =====================================================

  const openRejectModal = (item: LeaveRequest) => {
    setSelectedRequest(item);
    setCatatanAdmin("");
    setShowReject(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!catatanAdmin.trim()) {
      setMessage("Catatan penolakan wajib diisi.");
      setMessageType("error");
      return;
    }

    await processRequest(
      selectedRequest.id,
      "DITOLAK",
      catatanAdmin.trim()
    );
  };

  // =====================================================
  // DETAIL
  // =====================================================

  const openDetail = (item: LeaveRequest) => {
    setSelectedRequest(item);
    setShowDetail(true);
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const statusBadge = (status: string) => {
    if (status === "MENUNGGU") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Menunggu
        </span>
      );
    }

    if (status === "DITERIMA") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Diterima
        </span>
      );
    }

    if (status === "DITOLAK") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        {status}
      </span>
    );
  };

  // =====================================================
  // JENIS IZIN / SAKIT
  // =====================================================

  const typeBadge = (status: string) => {
    if (status === "SAKIT") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-100">
          🤒 Sakit
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
        📄 Izin
      </span>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Memuat halaman...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                onClick={() => router.push("/admin")}
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                ← Kembali ke Dashboard
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Pengajuan Izin & Sakit
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola pengajuan izin dan sakit siswa PKL.
              </p>
            </div>

            <button
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={loading ? "animate-spin" : ""}>
                ↻
              </span>
              {loading ? "Memuat..." : "Refresh Data"}
            </button>
          </div>

          {/* HERO */}

          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative max-w-2xl">
              <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                📋 ADMIN • PENGAJUAN SISWA
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Kelola izin dan sakit siswa dengan mudah
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                Periksa pengajuan siswa, lihat alasan, lalu berikan
                keputusan diterima atau ditolak.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <span className="text-base">
              {messageType === "success" ? "✓" : "!"}
            </span>

            <p>{message}</p>

            <button
              onClick={() => setMessage("")}
              className="ml-auto text-current opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Pengajuan
                </p>

                <p className="mt-2 text-3xl font-black text-slate-800">
                  {totalPengajuan}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                📋
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Seluruh pengajuan siswa
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Menunggu
                </p>

                <p className="mt-2 text-3xl font-black text-amber-600">
                  {totalMenunggu}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                ⏳
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Perlu diproses admin
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Diterima
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {totalDiterima}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                ✓
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Pengajuan disetujui
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Ditolak
                </p>

                <p className="mt-2 text-3xl font-black text-rose-600">
                  {totalDitolak}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl">
                ✕
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Pengajuan ditolak
            </p>
          </div>
        </div>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">
              Filter Pengajuan
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pilih status atau cari data siswa.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                ["SEMUA", "Semua"],
                ["MENUNGGU", "Menunggu"],
                ["DITERIMA", "Diterima"],
                ["DITOLAK", "Ditolak"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === value
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, kelas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLE / LIST
        ===================================================== */}

        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Pengajuan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-bold text-blue-600">
                  {filteredRequests.length}
                </span>{" "}
                pengajuan
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
              {filter === "SEMUA"
                ? "Semua Status"
                : filter}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data pengajuan...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                📭
              </div>

              <h3 className="font-bold text-slate-700">
                Belum ada pengajuan
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tidak ada data yang sesuai dengan filter atau pencarian.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Jenis
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 transition hover:bg-blue-50/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-black text-white">
                              {item.user.nama
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-slate-800">
                                {item.user.nama}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.user.nis || "-"} •{" "}
                                {item.user.kelas || "-"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatTanggal(item.tanggal)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {typeBadge(item.status)}
                        </td>

                        <td className="px-5 py-4">
                          {statusBadge(item.statusPengajuan)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openDetail(item)}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                            >
                              Detail
                            </button>

                            {item.statusPengajuan === "MENUNGGU" && (
                              <>
                                <button
                                  onClick={() => handleAccept(item)}
                                  disabled={processing}
                                  className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  ✓ Terima
                                </button>

                                <button
                                  onClick={() =>
                                    openRejectModal(item)
                                  }
                                  disabled={processing}
                                  className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                                >
                                  ✕ Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="space-y-4 p-4 md:hidden">
                {filteredRequests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 font-black text-white">
                        {item.user.nama
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800">
                              {item.user.nama}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.user.nis || "-"} •{" "}
                              {item.user.kelas || "-"}
                            </p>
                          </div>

                          {statusBadge(item.statusPengajuan)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold text-slate-400">
                          Tanggal
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {formatTanggal(item.tanggal)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold text-slate-400">
                          Jenis
                        </p>

                        <div className="mt-1">
                          {typeBadge(item.status)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Alasan
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">
                        {item.alasan}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openDetail(item)}
                        className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Detail
                      </button>

                      {item.statusPengajuan === "MENUNGGU" && (
                        <>
                          <button
                            onClick={() => handleAccept(item)}
                            disabled={processing}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            ✓
                          </button>

                          <button
                            onClick={() =>
                              openRejectModal(item)
                            }
                            disabled={processing}
                            className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* FOOTER INFO */}

        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              💡
            </div>

            <div>
              <p className="font-bold text-blue-900">
                Informasi
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Pengajuan yang masih berstatus{" "}
                <span className="font-bold">Menunggu</span>{" "}
                perlu diperiksa dan diproses oleh admin.
                Jika ditolak, catatan penolakan wajib diberikan
                agar siswa mengetahui alasannya.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetail && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[30px] border border-white/20 bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Detail Pengajuan
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-800">
                  Pengajuan #{selectedRequest.id}
                </h2>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">

              {/* SISWA */}

              <div className="rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-lg font-black text-white">
                    {selectedRequest.user.nama
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-black text-slate-800">
                      {selectedRequest.user.nama}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selectedRequest.user.username}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      NIS
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedRequest.user.nis || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      Kelas
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedRequest.user.kelas || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      Jurusan
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedRequest.user.jurusan || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      Tempat PKL
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {selectedRequest.user.tempatPkl || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Tanggal
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {formatTanggal(selectedRequest.tanggal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Jenis
                  </p>

                  <div className="mt-2">
                    {typeBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400">
                  Status Pengajuan
                </p>

                <div className="mt-2">
                  {statusBadge(selectedRequest.statusPengajuan)}
                </div>
              </div>

              {/* ALASAN */}

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400">
                  Alasan Pengajuan
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedRequest.alasan}
                </p>
              </div>

              {/* WAKTU */}

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-400">
                  Waktu Pengajuan
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {formatTanggalWaktu(
                    selectedRequest.createdAt
                  )}
                </p>
              </div>

              {/* CATATAN ADMIN */}

              {selectedRequest.catatanAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">
                    Catatan Admin
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {selectedRequest.catatanAdmin}
                  </p>
                </div>
              )}

              {/* BUTTON */}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Tutup
                </button>

                {selectedRequest.statusPengajuan === "MENUNGGU" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        handleAccept(selectedRequest);
                      }}
                      disabled={processing}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      ✓ Terima
                    </button>

                    <button
                      onClick={() => {
                        setShowDetail(false);
                        openRejectModal(selectedRequest);
                      }}
                      disabled={processing}
                      className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                    >
                      ✕ Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {showReject && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-2xl">

            <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50 to-white px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-lg">
                  ✕
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    Tolak Pengajuan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Pengajuan dari{" "}
                    <span className="font-bold text-slate-700">
                      {selectedRequest.user.nama}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Catatan / alasan penolakan
              </label>

              <textarea
                value={catatanAdmin}
                onChange={(e) =>
                  setCatatanAdmin(e.target.value)
                }
                rows={5}
                placeholder="Tuliskan alasan pengajuan ditolak..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Catatan ini akan membantu siswa mengetahui alasan
                pengajuannya ditolak.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    setShowReject(false);
                    setCatatanAdmin("");
                  }}
                  disabled={processing}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleReject}
                  disabled={
                    processing || !catatanAdmin.trim()
                  }
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Memproses..."
                    : "Tolak Pengajuan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}