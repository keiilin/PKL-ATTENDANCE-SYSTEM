"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  nis: string | null;
  kelas: string | null;
  jurusan: string | null;
  tempatPkl: string | null;
  aktif: boolean;
  role: string;
};

type Schedule = {
  id: number;
  userId: number;
  hari: string;
  jamMasuk: string;
  jamPulang: string;
  createdAt: string;
  updatedAt: string;
  user: User;
};

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export default function AdminJadwalPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<Schedule | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamPulang, setJamPulang] = useState("16:00");
  const [saving, setSaving] = useState(false);

  const [deletingSchedule, setDeletingSchedule] =
    useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // CEK LOGIN
  // =========================

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

  // =========================
  // GET JADWAL
  // =========================

  const getSchedules = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/schedules?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data jadwal.");
        return;
      }

      setSchedules(data.data || []);
    } catch (error) {
      console.error("GET SCHEDULES ERROR:", error);

      alert(
        "Terjadi kesalahan saat mengambil data jadwal."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET SISWA
  // =========================

  const getStudents = async () => {
    if (!user?.id) return;

    try {
      setLoadingStudents(true);

      const response = await fetch(
        `/api/admin/users?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      const studentData = (data.data || []).filter(
        (item: User) => item.role === "SISWA"
      );

      setStudents(studentData);
    } catch (error) {
      console.error("GET STUDENTS ERROR:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (user) {
      getSchedules();
      getStudents();
    }
  }, [user]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // =========================
  // FORMAT JAM
  // =========================

  const formatTime = (time: string) => {
    if (!time) return "-";
    return time.slice(0, 5);
  };

  // =========================
  // BUKA TAMBAH
  // =========================

  const openAdd = () => {
    setEditingSchedule(null);
    setSelectedUserId("");
    setSelectedHari("Senin");
    setJamMasuk("08:00");
    setJamPulang("16:00");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // BUKA EDIT
  // =========================

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);

    setSelectedUserId(String(schedule.userId));
    setSelectedHari(schedule.hari);
    setJamMasuk(formatTime(schedule.jamMasuk));
    setJamPulang(formatTime(schedule.jamPulang));

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // TUTUP FORM
  // =========================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingSchedule(null);
    setSelectedUserId("");
    setSelectedHari("Senin");
    setJamMasuk("08:00");
    setJamPulang("16:00");
  };

  // =========================
  // SIMPAN JADWAL
  // =========================

  const handleSave = async () => {
    if (!selectedUserId) {
      alert("Siswa wajib dipilih.");
      return;
    }

    if (!selectedHari) {
      alert("Hari wajib dipilih.");
      return;
    }

    if (!jamMasuk || !jamPulang) {
      alert("Jam masuk dan jam pulang wajib diisi.");
      return;
    }

    if (jamMasuk >= jamPulang) {
      alert(
        "Jam pulang harus lebih besar dari jam masuk."
      );
      return;
    }

    try {
      setSaving(true);

      const isEdit = Boolean(editingSchedule);

      const response = await fetch(
        "/api/admin/schedules",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEdit
              ? {
                  adminId: user.id,
                  id: editingSchedule?.id,
                  hari: selectedHari,
                  jamMasuk,
                  jamPulang,
                }
              : {
                  adminId: user.id,
                  userId: Number(selectedUserId),
                  hari: selectedHari,
                  jamMasuk,
                  jamPulang,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menyimpan jadwal."
        );
        return;
      }

      alert(
        data.message ||
          (isEdit
            ? "Jadwal berhasil diubah."
            : "Jadwal berhasil ditambahkan.")
      );

      closeForm();
      await getSchedules();
    } catch (error) {
      console.error("SAVE SCHEDULE ERROR:", error);

      alert(
        "Terjadi kesalahan saat menyimpan jadwal."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const openDelete = (schedule: Schedule) => {
    setDeletingSchedule(schedule);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeletingSchedule(null);
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/schedules?adminId=${user.id}&id=${deletingSchedule.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menghapus jadwal."
        );
        return;
      }

      alert(
        data.message || "Jadwal berhasil dihapus."
      );

      closeDelete();
      await getSchedules();
    } catch (error) {
      console.error("DELETE SCHEDULE ERROR:", error);

      alert(
        "Terjadi kesalahan saat menghapus jadwal."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // KELOMPOKKAN JADWAL
  // =========================

  const schedulesByDay = DAYS.map((hari) => ({
    hari,
    data: schedules.filter(
      (schedule) => schedule.hari === hari
    ),
  }));

  // =========================
  // STATISTIK
  // =========================

  const totalSchedules = schedules.length;

  const totalStudentsWithSchedule = new Set(
    schedules.map((schedule) => schedule.userId)
  ).size;

  const totalStudents = students.length;

  const totalActiveStudents = students.filter(
    (student) => student.aktif !== false
  ).length;

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />

          <p className="font-semibold text-slate-700">
            Memuat halaman jadwal...
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
                Manajemen Jadwal PKL
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================= HERO ================= */}

        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg shadow-indigo-100 sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

          <div className="absolute -bottom-16 right-28 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
                🗓️
              </div>

              <p className="text-sm font-medium text-white/75">
                Pengaturan waktu PKL siswa
              </p>

              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                Jadwal Masuk & Pulang
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Kelola jadwal masuk dan pulang setiap siswa
                untuk membantu sistem presensi PKL menentukan
                waktu kehadiran.
              </p>
            </div>

            <button
              onClick={openAdd}
              className="relative rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
            >
              ＋ Tambah Jadwal
            </button>
          </div>
        </section>

        {/* ================= STATISTIK ================= */}

        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Total Jadwal
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {totalSchedules}
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl sm:flex">
                🗓️
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Siswa Terjadwal
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-600">
                  {totalStudentsWithSchedule}
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl sm:flex">
                🎓
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Siswa Aktif
                </p>

                <p className="mt-1 text-3xl font-bold text-emerald-600">
                  {totalActiveStudents}
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl sm:flex">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Total Siswa
                </p>

                <p className="mt-1 text-3xl font-bold text-purple-600">
                  {totalStudents}
                </p>
              </div>

              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl sm:flex">
                👥
              </div>
            </div>
          </div>
        </section>

        {/* ================= FORM ================= */}

        {showForm && (
          <section className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                      {editingSchedule ? "✏️" : "➕"}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {editingSchedule
                          ? "Edit Jadwal"
                          : "Tambah Jadwal"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {editingSchedule
                          ? "Ubah jadwal PKL siswa"
                          : "Tambahkan jadwal PKL untuk siswa"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                {/* SISWA */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Siswa
                  </label>

                  {editingSchedule ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600">
                          {editingSchedule.user?.nama
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </div>

                        <div>
                          <p className="font-bold text-slate-800">
                            {editingSchedule.user?.nama || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {editingSchedule.user?.kelas || "-"}
                            {" • "}
                            {editingSchedule.user?.tempatPkl || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={selectedUserId}
                      onChange={(e) =>
                        setSelectedUserId(e.target.value)
                      }
                      disabled={loadingStudents}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-100"
                    >
                      <option value="">
                        {loadingStudents
                          ? "Memuat siswa..."
                          : "Pilih siswa"}
                      </option>

                      {students
                        .filter(
                          (student) => student.aktif !== false
                        )
                        .map((student) => (
                          <option
                            key={student.id}
                            value={student.id}
                          >
                            {student.nama}
                            {student.kelas
                              ? ` — ${student.kelas}`
                              : ""}
                            {student.nis
                              ? ` — NIS ${student.nis}`
                              : ""}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* HARI */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hari
                  </label>

                  <select
                    value={selectedHari}
                    onChange={(e) =>
                      setSelectedHari(e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  >
                    {DAYS.map((hari) => (
                      <option key={hari} value={hari}>
                        {hari}
                      </option>
                    ))}
                  </select>
                </div>

                {/* JAM MASUK */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Jam Masuk
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🟢
                    </span>

                    <input
                      type="time"
                      value={jamMasuk}
                      onChange={(e) =>
                        setJamMasuk(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>

                {/* JAM PULANG */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Jam Pulang
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔴
                    </span>

                    <input
                      type="time"
                      value={jamPulang}
                      onChange={(e) =>
                        setJamPulang(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                </div>
              </div>

              {/* PREVIEW */}

              {jamMasuk && jamPulang && (
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                    Preview Jadwal
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      🗓️ {selectedHari}
                    </span>

                    <span className="text-slate-400">•</span>

                    <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      🟢 {jamMasuk}
                    </span>

                    <span className="text-slate-400">→</span>

                    <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                      🔴 {jamPulang}
                    </span>
                  </div>
                </div>
              )}

              {/* BUTTON */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !selectedUserId ||
                    !jamMasuk ||
                    !jamPulang
                  }
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingSchedule
                    ? "💾 Simpan Perubahan"
                    : "＋ Tambah Jadwal"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= DATA JADWAL ================= */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Data Jadwal Siswa
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Jadwal masuk dan pulang siswa PKL
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={getSchedules}
                disabled={loading}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 sm:flex-none"
              >
                {loading ? "Memuat..." : "↻ Refresh"}
              </button>

              <button
                onClick={openAdd}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 sm:flex-none"
              >
                ＋ Tambah
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data jadwal...
              </p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                🗓️
              </div>

              <p className="mt-4 font-bold text-slate-700">
                Belum ada jadwal
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-400">
                Jadwal siswa dapat ditambahkan melalui tombol
                Tambah Jadwal.
              </p>

              <button
                onClick={openAdd}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                ＋ Tambah Jadwal
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Kelas
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Tempat PKL
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Hari
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Jam Masuk
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Jam Pulang
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                              {schedule.user?.nama
                                ?.charAt(0)
                                .toUpperCase() || "?"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {schedule.user?.nama || "-"}
                              </p>

                              {schedule.user?.nis && (
                                <p className="mt-1 text-xs text-slate-400">
                                  NIS: {schedule.user.nis}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {schedule.user?.kelas || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {schedule.user?.jurusan || "-"}
                          </p>
                        </td>

                        <td className="max-w-[180px] px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {schedule.user?.tempatPkl || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                            {schedule.hari}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600">
                            {formatTime(schedule.jamMasuk)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-600">
                            {formatTime(schedule.jamPulang)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(schedule)
                              }
                              className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(schedule)
                              }
                              className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="space-y-4 p-4 md:hidden">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white">
                        {schedule.user?.nama
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-slate-800">
                          {schedule.user?.nama || "-"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {schedule.user?.kelas || "-"} •{" "}
                          {schedule.user?.jurusan || "-"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                        {schedule.hari}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Jam Masuk
                        </p>

                        <p className="mt-1 font-bold text-emerald-600">
                          {formatTime(schedule.jamMasuk)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Jam Pulang
                        </p>

                        <p className="mt-1 font-bold text-rose-600">
                          {formatTime(schedule.jamPulang)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Tempat PKL
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {schedule.user?.tempatPkl || "-"}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(schedule)}
                        className="rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDelete(schedule)}
                        className="rounded-xl bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ================= RINGKASAN PER HARI ================= */}

        {schedules.length > 0 && (
          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Ringkasan Jadwal
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Jumlah siswa berdasarkan hari PKL
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              {schedulesByDay.map(({ hari, data }) => (
                <div
                  key={hari}
                  className={`rounded-2xl border p-4 text-center transition ${
                    data.length > 0
                      ? "border-indigo-100 bg-indigo-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-700">
                    {hari}
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold ${
                      data.length > 0
                        ? "text-indigo-600"
                        : "text-slate-400"
                    }`}
                  >
                    {data.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    siswa
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ================= MODAL DELETE ================= */}

      {deletingSchedule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeDelete}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-7">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-3xl">
                  ⚠️
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-800">
                  Hapus Jadwal?
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Kamu akan menghapus jadwal:
                </p>

                <p className="mt-2 font-bold text-slate-800">
                  {deletingSchedule.user?.nama || "-"}
                </p>

                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                    {deletingSchedule.hari}
                  </span>

                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                    {formatTime(deletingSchedule.jamMasuk)}
                  </span>

                  <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">
                    {formatTime(deletingSchedule.jamPulang)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-sm leading-6 text-rose-700">
                  Jadwal ini akan dihapus dari sistem dan
                  tidak dapat digunakan lagi untuk menentukan
                  jadwal presensi siswa.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-rose-500 py-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
                >
                  {deleting
                    ? "Menghapus..."
                    : "🗑️ Hapus Jadwal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}