"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Attendance = {
  id: number;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
  alasanTerlambat: string | null;
  alasanPulangTelat: string | null;
  fotoMasuk: string | null;
  fotoPulang: string | null;
  user: {
    nama: string;
    kelas: string | null;
    tempatPkl: string | null;
  };
};

type AttendanceHistory = {
  id: number;
  attendanceId: number | null;
  action: string;
  reason: string;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
  alasanTerlambat: string | null;
  alasanPulangTelat: string | null;
  fotoMasuk: string | null;
  fotoPulang: string | null;
  createdAt: string;
  user: {
    id: number;
    nama: string;
    username: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
  };
  admin: {
    id: number;
    nama: string;
    username: string;
  };
};

export default function AdminPage() {
  const router = useRouter();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // EDIT
  const [editingAttendance, setEditingAttendance] =
    useState<Attendance | null>(null);
  const [editJamMasuk, setEditJamMasuk] = useState("");
  const [editJamPulang, setEditJamPulang] = useState("");
  const [editStatus, setEditStatus] = useState("HADIR");
  const [editAlasanTerlambat, setEditAlasanTerlambat] = useState("");
  const [editAlasanPulangTelat, setEditAlasanPulangTelat] = useState("");
  const [editReason, setEditReason] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // DELETE
  const [deletingAttendance, setDeletingAttendance] =
    useState<Attendance | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);

  // HISTORY
  const [histories, setHistories] = useState<AttendanceHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // LOGIN
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // GET ATTENDANCES
  const getAttendances = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/attendance");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setAttendances(data.data || []);
    } catch (error) {
      console.error("GET ATTENDANCES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAttendances();
    }
  }, [user]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // FORMAT TIME
  const formatTime = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FORMAT DATE
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // FORMAT DATETIME LOCAL
  const formatDateTimeLocal = (date: string | null) => {
    if (!date) return "";

    const value = new Date(date);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // FORMAT HISTORY
  const formatHistoryDateTime = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // STATISTIK
  const totalAttendance = attendances.length;

  const sudahPulang = attendances.filter(
    (item) => item.jamPulang
  ).length;

  const masihPKL = attendances.filter(
    (item) => !item.jamPulang
  ).length;

  const terlambat = attendances.filter(
    (item) => item.alasanTerlambat
  ).length;

  const pulangTelat = attendances.filter(
    (item) => item.alasanPulangTelat
  ).length;

  // EDIT
  const openEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);

    setEditJamMasuk(
      formatDateTimeLocal(attendance.jamMasuk)
    );

    setEditJamPulang(
      formatDateTimeLocal(attendance.jamPulang)
    );

    setEditStatus(attendance.status || "HADIR");

    setEditAlasanTerlambat(
      attendance.alasanTerlambat || ""
    );

    setEditAlasanPulangTelat(
      attendance.alasanPulangTelat || ""
    );

    setEditReason("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingAttendance(null);
    setEditJamMasuk("");
    setEditJamPulang("");
    setEditStatus("HADIR");
    setEditAlasanTerlambat("");
    setEditAlasanPulangTelat("");
    setEditReason("");
  };

  const handleEdit = async () => {
    if (!editingAttendance) return;

    if (!editReason.trim()) {
      alert("Alasan perubahan wajib diisi.");
      return;
    }

    try {
      setSavingEdit(true);

      const response = await fetch(
        "/api/admin/attendance/edit",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendanceId: editingAttendance.id,
            adminId: user.id,
            jamMasuk: editJamMasuk || null,
            jamPulang: editJamPulang || null,
            status: editStatus,
            alasanTerlambat: editAlasanTerlambat,
            alasanPulangTelat: editAlasanPulangTelat,
            reason: editReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengubah absensi."
        );
        return;
      }

      alert(
        data.message ||
          "Absensi berhasil diubah."
      );

      closeEdit();
      await getAttendances();
    } catch (error) {
      console.error(
        "EDIT ATTENDANCE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengubah absensi."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // DELETE
  const openDelete = (attendance: Attendance) => {
    setDeletingAttendance(attendance);
    setDeleteReason("");
  };

  const closeDelete = () => {
    if (deleting) return;

    setDeletingAttendance(null);
    setDeleteReason("");
  };

  const handleDelete = async () => {
    if (!deletingAttendance) return;

    if (!deleteReason.trim()) {
      alert(
        "Alasan penghapusan wajib diisi."
      );
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        "/api/admin/attendance/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            attendanceId:
              deletingAttendance.id,
            adminId: user.id,
            reason:
              deleteReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus absensi."
        );
        return;
      }

      alert(
        data.message ||
          "Absensi berhasil dihapus."
      );

      closeDelete();
      await getAttendances();
    } catch (error) {
      console.error(
        "DELETE ATTENDANCE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus absensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  // HISTORY
  const getHistory = async () => {
    if (!user?.id) return;

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `/api/admin/attendance/history?adminId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil histori."
        );
        return;
      }

      setHistories(data.data || []);
      setShowHistory(true);
    } catch (error) {
      console.error(
        "GET HISTORY ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil histori."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto">

        {/* HEADER */}
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden mb-6">
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 lg:p-10 text-white overflow-hidden">

            <div className="absolute -right-16 -top-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute right-20 -bottom-28 w-72 h-72 bg-white/10 rounded-full" />
            <div className="absolute left-1/2 top-10 w-24 h-24 bg-white/5 rounded-full" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
                  <span>●</span>
                  PKL ATTENDANCE SYSTEM
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Dashboard Admin
                </h1>

                <p className="text-blue-100 mt-2 max-w-xl">
                  Pantau dan kelola data presensi siswa PKL
                  secara terpusat.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <div className="w-11 h-11 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {user.nama?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="mr-2">
                  <p className="font-bold">
                    {user.nama}
                  </p>
                  <p className="text-xs text-blue-100">
                    Administrator
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl bg-white text-red-500 hover:bg-red-50 font-bold text-sm transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                #
              </div>
              <span className="text-xs font-semibold text-slate-400">
                DATA
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Total Absensi
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              {totalAttendance}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                ✓
              </div>
              <span className="text-xs font-semibold text-emerald-500">
                SELESAI
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Sudah Pulang
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {sudahPulang}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                ↗
              </div>
              <span className="text-xs font-semibold text-indigo-500">
                AKTIF
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Masih PKL
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">
              {masihPKL}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                !
              </div>
              <span className="text-xs font-semibold text-amber-500">
                PERLU CEK
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Terlambat
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {terlambat}
            </p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                ↙
              </div>
              <span className="text-xs font-semibold text-purple-500">
                KETERANGAN
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Pulang Telat
            </p>

            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
              {pulangTelat}
            </p>
          </div>
        </section>

        {/* DATA ABSENSI */}
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

          {/* SECTION HEADER */}
          <div className="p-5 sm:p-6 lg:p-7 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    ✓
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                      Data Kehadiran Siswa
                    </h2>

                    <p className="text-sm text-slate-500 mt-0.5">
                      Monitoring aktivitas presensi siswa PKL
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={getHistory}
                  disabled={historyLoading}
                  className="px-5 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100 font-bold text-sm transition disabled:opacity-50"
                >
                  {historyLoading
                    ? "Memuat..."
                    : "Histori Absensi"}
                </button>

                <button
                  onClick={getAttendances}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition disabled:opacity-50"
                >
                  {loading
                    ? "Memuat..."
                    : "↻ Refresh Data"}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="p-4 sm:p-6">

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-11 h-11 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  Memuat data absensi...
                </p>
              </div>
            ) : attendances.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto text-2xl mb-4">
                  📋
                </div>

                <p className="font-bold text-slate-700">
                  Belum ada data absensi
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Data presensi siswa akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1450px] border-collapse">

                  <thead>
                    <tr className="bg-slate-50">
                      {[
                        "Nama",
                        "Kelas",
                        "Tempat PKL",
                        "Tanggal",
                        "Masuk",
                        "Foto Masuk",
                        "Pulang",
                        "Foto Pulang",
                        "Keterangan",
                        "Status",
                        "Aksi",
                      ].map((title) => (
                        <th
                          key={title}
                          className="px-4 py-4 text-left text-xs font-extrabold uppercase tracking-wide text-slate-500 border-b border-slate-200"
                        >
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {attendances.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/30 transition"
                      >
                        <td className="px-4 py-4 border-b border-slate-100">
                          <p className="font-bold text-slate-800">
                            {item.user?.nama || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                            {item.user?.kelas || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          <p className="max-w-[180px] text-sm text-slate-600">
                            {item.user?.tempatPkl || "-"}
                          </p>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100 whitespace-nowrap">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(item.tanggal)}
                          </p>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                            {formatTime(item.jamMasuk)}
                          </span>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          {item.fotoMasuk ? (
                            <button
                              onClick={() =>
                                setSelectedPhoto(item.fotoMasuk)
                              }
                              className="group"
                            >
                              <img
                                src={item.fotoMasuk}
                                alt="Foto masuk"
                                className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Tidak ada
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100 whitespace-nowrap">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                            {formatTime(item.jamPulang)}
                          </span>
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          {item.fotoPulang ? (
                            <button
                              onClick={() =>
                                setSelectedPhoto(item.fotoPulang)
                              }
                              className="group"
                            >
                              <img
                                src={item.fotoPulang}
                                alt="Foto pulang"
                                className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:scale-105 transition"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Tidak ada
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100 max-w-xs">
                          {item.alasanTerlambat ||
                          item.alasanPulangTelat ? (
                            <div className="space-y-3">
                              {item.alasanTerlambat && (
                                <div>
                                  <span className="inline-flex px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold">
                                    TERLAMBAT
                                  </span>

                                  <p className="text-sm text-slate-600 mt-1">
                                    {item.alasanTerlambat}
                                  </p>
                                </div>
                              )}

                              {item.alasanPulangTelat && (
                                <div>
                                  <span className="inline-flex px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold">
                                    PULANG TELAT
                                  </span>

                                  <p className="text-sm text-slate-600 mt-1">
                                    {item.alasanPulangTelat}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">
                              Tidak ada keterangan
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          {!item.jamPulang ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Sedang PKL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Selesai
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 border-b border-slate-100">
                          <div className="flex flex-col gap-2 min-w-[110px]">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(item)
                              }
                              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(item)
                              }
                              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL FOTO */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Foto absensi"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={() =>
                setSelectedPhoto(null)
              }
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-slate-700 font-bold shadow-lg hover:bg-slate-100 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editingAttendance && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[28px] shadow-2xl">

            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                    EDIT DATA
                  </span>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                    Edit Absensi
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {editingAttendance.user?.nama}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(
                      editingAttendance.tanggal
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={savingEdit}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Jam Masuk
                </label>

                <input
                  type="datetime-local"
                  value={editJamMasuk}
                  onChange={(e) =>
                    setEditJamMasuk(e.target.value)
                  }
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Jam Pulang
                </label>

                <input
                  type="datetime-local"
                  value={editJamPulang}
                  onChange={(e) =>
                    setEditJamPulang(e.target.value)
                  }
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="HADIR">HADIR</option>
                  <option value="TERLAMBAT">
                    TERLAMBAT
                  </option>
                  <option value="IZIN">IZIN</option>
                  <option value="SAKIT">SAKIT</option>
                  <option value="ALPA">ALPA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alasan Terlambat
                </label>

                <textarea
                  value={editAlasanTerlambat}
                  onChange={(e) =>
                    setEditAlasanTerlambat(
                      e.target.value
                    )
                  }
                  placeholder="Kosongkan jika tidak ada..."
                  className="w-full min-h-24 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alasan Pulang Telat
                </label>

                <textarea
                  value={editAlasanPulangTelat}
                  onChange={(e) =>
                    setEditAlasanPulangTelat(
                      e.target.value
                    )
                  }
                  placeholder="Kosongkan jika tidak ada..."
                  className="w-full min-h-24 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <label className="block text-sm font-bold text-amber-800 mb-2">
                  Alasan Perubahan
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <textarea
                  value={editReason}
                  onChange={(e) =>
                    setEditReason(e.target.value)
                  }
                  placeholder="Contoh: Koreksi jam masuk berdasarkan bukti absensi..."
                  className="w-full min-h-28 bg-white border border-amber-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 transition resize-none"
                />

                <p className="text-xs text-amber-700 mt-2">
                  Data sebelum perubahan akan otomatis masuk ke histori.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  savingEdit ||
                  !editReason.trim()
                }
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 transition"
              >
                {savingEdit
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deletingAttendance && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden">

            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto">
                !
              </div>

              <div className="text-center mt-4">
                <h2 className="text-xl font-extrabold text-slate-800">
                  Hapus Absensi?
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Kamu akan menghapus data absensi:
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {deletingAttendance.user?.nama}
                </p>

                <p className="text-sm text-slate-500">
                  {formatDate(
                    deletingAttendance.tanggal
                  )}
                </p>
              </div>

              <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-sm text-amber-800 leading-relaxed">
                  Data absensi akan dihapus dari data aktif,
                  tetapi salinannya tetap disimpan di
                  <strong> Histori Absensi</strong>.
                </p>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Alasan Penghapusan
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <textarea
                  value={deleteReason}
                  onChange={(e) =>
                    setDeleteReason(e.target.value)
                  }
                  placeholder="Contoh: Data absensi tidak valid..."
                  className="w-full min-h-28 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 transition resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    deleting ||
                    !deleteReason.trim()
                  }
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold disabled:opacity-50 transition"
                >
                  {deleting
                    ? "Menghapus..."
                    : "Hapus Absensi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORY */}
      {showHistory && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[28px] shadow-2xl flex flex-col">

            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
                  AUDIT LOG
                </span>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  Histori Absensi
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Riwayat perubahan dan penghapusan data absensi
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowHistory(false)
                }
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 bg-[#f7f9fc]">

              {historyLoading ? (
                <div className="py-16 text-center">
                  <div className="w-11 h-11 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                  <p className="text-slate-500 font-medium">
                    Memuat histori...
                  </p>
                </div>
              ) : histories.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl mb-4">
                    ↺
                  </div>

                  <p className="font-bold text-slate-700">
                    Belum ada histori
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Perubahan atau penghapusan absensi akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  {histories.map((history) => (
                    <div
                      key={history.id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                        <div>
                          <div className="flex flex-wrap items-center gap-2">

                            <span className="font-extrabold text-slate-800">
                              {history.user?.nama || "-"}
                            </span>

                            {history.user?.kelas && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                                {history.user.kelas}
                              </span>
                            )}

                            <span
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                                history.action === "DIHAPUS"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {history.action}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 mt-2">
                            {formatDate(history.tanggal)}
                          </p>
                        </div>

                        <div className="lg:text-right">
                          <p className="text-xs text-slate-400">
                            Tindakan oleh
                          </p>

                          <p className="text-sm font-bold text-slate-700">
                            {history.admin?.nama || "-"}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {formatHistoryDateTime(
                              history.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {/* DATA */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400">
                            Jam Masuk
                          </p>

                          <p className="font-bold text-slate-700 mt-1">
                            {formatTime(
                              history.jamMasuk
                            )}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400">
                            Jam Pulang
                          </p>

                          <p className="font-bold text-slate-700 mt-1">
                            {formatTime(
                              history.jamPulang
                            )}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400">
                            Status
                          </p>

                          <p className="font-bold text-slate-700 mt-1">
                            {history.status || "-"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <p className="text-xs text-slate-400">
                            ID Absensi
                          </p>

                          <p className="font-bold text-slate-700 mt-1">
                            #
                            {history.attendanceId || "-"}
                          </p>
                        </div>
                      </div>

                      {/* KETERANGAN */}
                      {(history.alasanTerlambat ||
                        history.alasanPulangTelat) && (
                        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <p className="text-sm font-extrabold text-slate-700 mb-3">
                            Keterangan Absensi
                          </p>

                          {history.alasanTerlambat && (
                            <div className="mb-3">
                              <span className="text-[10px] font-extrabold text-amber-600">
                                TERLAMBAT
                              </span>

                              <p className="text-sm text-slate-600 mt-1">
                                {history.alasanTerlambat}
                              </p>
                            </div>
                          )}

                          {history.alasanPulangTelat && (
                            <div>
                              <span className="text-[10px] font-extrabold text-purple-600">
                                PULANG TELAT
                              </span>

                              <p className="text-sm text-slate-600 mt-1">
                                {history.alasanPulangTelat}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ALASAN ADMIN */}
                      <div className="mt-4 bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm font-extrabold text-blue-800">
                          Alasan Tindakan Admin
                        </p>

                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {history.reason}
                        </p>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}