"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  nis?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
  aktif: boolean;
};

type FormData = {
  nama: string;
  username: string;
  password: string;
  role: string;
  nis: string;
  kelas: string;
  jurusan: string;
  tempatPkl: string;
};

const initialForm: FormData = {
  nama: "",
  username: "",
  password: "",
  role: "SISWA",
  nis: "",
  kelas: "",
  jurusan: "",
  tempatPkl: "",
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  // =========================
  // CEK ADMIN
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

      getUsers();
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  // =========================
  // GET USERS
  // =========================
  const getUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data user");
        return;
      }

      setUsers(data.data || []);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TAMBAH USER
  // =========================
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menambahkan user");
        return;
      }

      alert("✅ User berhasil ditambahkan!");

      setForm(initialForm);
      setShowForm(false);

      await getUsers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menambahkan user");
    }
  };

  // =========================
  // EDIT USER
  // =========================
  const handleEdit = (user: User) => {
    setEditingUser(user);

    setForm({
      nama: user.nama || "",
      username: user.username || "",
      password: "",
      role: user.role || "SISWA",
      nis: user.nis || "",
      kelas: user.kelas || "",
      jurusan: user.jurusan || "",
      tempatPkl: user.tempatPkl || "",
    });

    setShowForm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE USER
  // =========================
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      const response = await fetch("/api/admin/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui user");
        return;
      }

      alert("✅ User berhasil diperbarui!");

      setEditingUser(null);
      setForm(initialForm);

      await getUsers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui user");
    }
  };

  // =========================
  // UBAH STATUS USER
  // =========================
  const handleStatusChange = async (user: User) => {
    const newStatus = !user.aktif;

    const actionText = newStatus
      ? "mengaktifkan"
      : "menonaktifkan";

    const yakin = confirm(
      `Yakin ingin ${actionText} akun "${user.nama}"?`
    );

    if (!yakin) return;

    try {
      setChangingStatus(user.id);

      const response = await fetch("/api/admin/users/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          aktif: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengubah status akun");
        return;
      }

      alert(
        newStatus
          ? "✅ Akun berhasil diaktifkan!"
          : "🔒 Akun berhasil dinonaktifkan!"
      );

      await getUsers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengubah status akun");
    } finally {
      setChangingStatus(null);
    }
  };

  // =========================
  // BATAL
  // =========================
  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm(initialForm);
  };

  // =========================
  // ROLE STYLE
  // =========================
  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-50 text-rose-700 border-rose-100";

      case "PEMBIMBING":
        return "bg-purple-50 text-purple-700 border-purple-100";

      case "KETUA_JURUSAN":
        return "bg-amber-50 text-amber-700 border-amber-100";

      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  // =========================
  // ROLE LABEL
  // =========================
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";

      case "PEMBIMBING":
        return "Pembimbing";

      case "KETUA_JURUSAN":
        return "Ketua Jurusan";

      default:
        return "Siswa";
    }
  };

  // =========================
  // STATISTIK
  // =========================
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.aktif).length;
  const inactiveUsers = users.filter((user) => !user.aktif).length;
  const studentUsers = users.filter(
    (user) => user.role === "SISWA"
  ).length;

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
              Manajemen User
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                👥 USER MANAGEMENT
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Manajemen User
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                Kelola akun siswa, pembimbing, ketua jurusan, dan admin
                dalam sistem PKL.
              </p>
            </div>

            {!editingUser && (
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setForm(initialForm);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {showForm ? (
                  <>
                    ✕ Tutup Form
                  </>
                ) : (
                  <>
                    ＋ Tambah User
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ================= STATISTIK ================= */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[24px] border border-blue-100 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                👥
              </div>

              <span className="text-xs font-semibold text-blue-600">
                TOTAL
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {totalUsers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Seluruh pengguna
            </p>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                ✓
              </div>

              <span className="text-xs font-semibold text-emerald-600">
                AKTIF
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {activeUsers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Akun aktif
            </p>
          </div>

          <div className="rounded-[24px] border border-amber-100 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                🎓
              </div>

              <span className="text-xs font-semibold text-amber-600">
                SISWA
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {studentUsers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Akun siswa
            </p>
          </div>

          <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg">
                🔒
              </div>

              <span className="text-xs font-semibold text-rose-600">
                NONAKTIF
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {inactiveUsers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Akun nonaktif
            </p>
          </div>
        </div>

        {/* ================= FORM TAMBAH ================= */}
        {showForm && !editingUser && (
          <div className="mb-6 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-5 text-white md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl">
                  👤
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Tambah User Baru
                  </h2>

                  <p className="text-sm text-blue-100">
                    Buat akun baru untuk pengguna sistem PKL.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAdd}
              className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6"
            >
              <InputField
                label="Nama Lengkap"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                required
              />

              <InputField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                required
              />

              <InputField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                required
              />

              <SelectField
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
              />

              <InputField
                label="NIS"
                name="nis"
                value={form.nis}
                onChange={handleChange}
                placeholder="Masukkan NIS"
              />

              <InputField
                label="Kelas"
                name="kelas"
                value={form.kelas}
                onChange={handleChange}
                placeholder="Contoh: XI RPL 2"
              />

              <InputField
                label="Jurusan"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                placeholder="Contoh: Rekayasa Perangkat Lunak"
              />

              <InputField
                label="Tempat PKL"
                name="tempatPkl"
                value={form.tempatPkl}
                onChange={handleChange}
                placeholder="Nama tempat PKL"
              />

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-semibold text-white shadow-md shadow-emerald-100 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  💾 Simpan User
                </button>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-2xl bg-slate-100 px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= FORM EDIT ================= */}
        {editingUser && (
          <div className="mb-6 overflow-hidden rounded-[28px] border border-indigo-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-5 text-white md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-xl">
                    ✏️
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Edit User
                    </h2>

                    <p className="text-sm text-indigo-100">
                      Mengubah data {editingUser.nama}
                    </p>
                  </div>
                </div>

                <button
                  onClick={cancelForm}
                  className="rounded-xl bg-white/10 px-3 py-2 text-white transition hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>

            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6"
            >
              <InputField
                label="Nama Lengkap"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
              />

              <InputField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />

              <InputField
                label="Password Baru"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak diubah"
              />

              <SelectField
                label="Role"
                name="role"
                value={form.role}
                onChange={handleChange}
              />

              <InputField
                label="NIS"
                name="nis"
                value={form.nis}
                onChange={handleChange}
              />

              <InputField
                label="Kelas"
                name="kelas"
                value={form.kelas}
                onChange={handleChange}
              />

              <InputField
                label="Jurusan"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
              />

              <InputField
                label="Tempat PKL"
                name="tempatPkl"
                value={form.tempatPkl}
                onChange={handleChange}
              />

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 md:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-semibold text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  💾 Simpan Perubahan
                </button>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-2xl bg-slate-100 px-7 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= DAFTAR USER ================= */}
        <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    Daftar User
                  </h2>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    {users.length}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Daftar seluruh akun yang terdaftar dalam sistem.
                </p>
              </div>

              <button
                onClick={getUsers}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                👥
              </div>

              <p className="font-semibold text-slate-700">
                Memuat data user...
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Mohon tunggu sebentar.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                👤
              </div>

              <p className="font-bold text-slate-700">
                Belum ada user
              </p>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Belum terdapat akun pengguna. Tambahkan user menggunakan
                tombol di bagian atas.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1250px] text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4 text-left font-bold">
                        No
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Nama
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Username
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Role
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        NIS
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Kelas
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Jurusan
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Tempat PKL
                      </th>

                      <th className="px-5 py-4 text-left font-bold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 transition hover:bg-blue-50/30"
                      >
                        <td className="px-5 py-4 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700">
                              {user.nama.charAt(0).toUpperCase()}
                            </div>

                            <span className="font-semibold text-slate-800">
                              {user.nama}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          @{user.username}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getRoleStyle(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {user.aktif ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Nonaktif
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {user.nis || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {user.kelas || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {user.jurusan || "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {user.tempatPkl || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                            >
                              ✏️ Edit
                            </button>

                            {user.aktif ? (
                              <button
                                onClick={() =>
                                  handleStatusChange(user)
                                }
                                disabled={changingStatus === user.id}
                                className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {changingStatus === user.id
                                  ? "⏳ Proses..."
                                  : "🔒 Nonaktifkan"}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStatusChange(user)
                                }
                                disabled={changingStatus === user.id}
                                className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {changingStatus === user.id
                                  ? "⏳ Proses..."
                                  : "🟢 Aktifkan"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="space-y-3 p-4 md:hidden">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-800">
                            {user.nama}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-slate-400">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Role
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Status
                        </p>

                        {user.aktif ? (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl bg-white p-3 text-xs">
                      <InfoRow label="NIS" value={user.nis} />
                      <InfoRow label="Kelas" value={user.kelas} />
                      <InfoRow label="Jurusan" value={user.jurusan} />
                      <InfoRow
                        label="Tempat PKL"
                        value={user.tempatPkl}
                      />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 rounded-xl bg-amber-50 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        ✏️ Edit
                      </button>

                      {user.aktif ? (
                        <button
                          onClick={() =>
                            handleStatusChange(user)
                          }
                          disabled={changingStatus === user.id}
                          className="flex-1 rounded-xl bg-rose-50 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          {changingStatus === user.id
                            ? "⏳ Proses..."
                            : "🔒 Nonaktifkan"}
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(user)
                          }
                          disabled={changingStatus === user.id}
                          className="flex-1 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {changingStatus === user.id
                            ? "⏳ Proses..."
                            : "🟢 Aktifkan"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ================= FOOTER INFO ================= */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="text-lg">💡</div>

          <div>
            <p className="text-sm font-bold text-blue-800">
              Informasi Manajemen User
            </p>

            <p className="mt-1 text-xs leading-relaxed text-blue-700">
              Pastikan data akun dan role pengguna sudah sesuai.
              Akun yang dinonaktifkan tidak dapat digunakan untuk
              mengakses sistem sampai diaktifkan kembali.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// =========================
// INPUT FIELD
// =========================
function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}

// =========================
// SELECT FIELD
// =========================
function SelectField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
      >
        <option value="SISWA">Siswa</option>
        <option value="PEMBIMBING">Pembimbing</option>
        <option value="KETUA_JURUSAN">
          Ketua Jurusan
        </option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
  );
}

// =========================
// INFO ROW MOBILE
// =========================
function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="font-semibold text-slate-400">
        {label}
      </span>

      <span className="text-right font-medium text-slate-700">
        {value || "-"}
      </span>
    </div>
  );
}