"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username?: string;
  role: string;
};

type Student = {
  id: number;
  nama: string;
  nis?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
};

export default function KetuaJurusanSiswaPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "KETUA_JURUSAN") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const getStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/ketua-jurusan/siswa"
      );

      const data = await response.json();

      if (response.ok) {
        setStudents(data.data || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getStudents();
    }
  }, [user]);

  const filteredStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return students;

    return students.filter((student) => {
      return (
        student.nama?.toLowerCase().includes(keyword) ||
        student.nis?.toLowerCase().includes(keyword) ||
        student.kelas?.toLowerCase().includes(keyword) ||
        student.jurusan?.toLowerCase().includes(keyword) ||
        student.tempatPkl?.toLowerCase().includes(keyword)
      );
    });
  }, [students, search]);

  const totalStudents = students.length;

  const totalClasses = new Set(
    students
      .map((student) => student.kelas)
      .filter(Boolean)
  ).size;

  const totalJurusan = new Set(
    students
      .map((student) => student.jurusan)
      .filter(Boolean)
  ).size;

  const totalTempatPkl = new Set(
    students
      .map((student) => student.tempatPkl)
      .filter(Boolean)
  ).size;

  if (!user || loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
            <span className="text-2xl animate-pulse">
              👨‍🎓
            </span>
          </div>

          <p className="font-semibold text-slate-700">
            Memuat data siswa...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <span>Ketua Jurusan</span>
              <span>/</span>
              <span className="text-slate-600 font-medium">
                Data Siswa
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Data Siswa PKL
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Monitoring seluruh siswa yang sedang melaksanakan PKL.
            </p>
          </div>

          <button
            onClick={getStudents}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-200 transition"
          >
            <span>↻</span>
            Refresh
          </button>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="absolute -right-6 -top-10 text-[100px] opacity-15">
            👨‍🎓
          </div>

          <div className="absolute right-28 bottom-0 text-7xl opacity-10">
            ✨
          </div>

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-semibold mb-4">
              <span>🎓</span>
              Monitoring Siswa PKL
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Data Siswa yang Melaksanakan PKL
            </h2>

            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              Lihat informasi siswa, kelas, jurusan, dan tempat
              pelaksanaan PKL secara terpusat.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                👨‍🎓
              </div>

              <span className="text-xs font-semibold text-slate-400">
                SISWA
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {totalStudents}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total siswa PKL
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">
                🏫
              </div>

              <span className="text-xs font-semibold text-slate-400">
                KELAS
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {totalClasses}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Kelas terdaftar
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                📚
              </div>

              <span className="text-xs font-semibold text-slate-400">
                JURUSAN
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {totalJurusan}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Jurusan terdaftar
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                🏢
              </div>

              <span className="text-xs font-semibold text-slate-400">
                TEMPAT PKL
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {totalTempatPkl}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Tempat terdaftar
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, kelas, jurusan, atau tempat PKL..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition"
              />
            </div>

            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 whitespace-nowrap">
              {filteredStudents.length} siswa ditemukan
            </div>
          </div>
        </div>

        {/* DATA SISWA */}
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Siswa PKL
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Informasi siswa yang sedang melaksanakan kegiatan PKL.
            </p>
          </div>

          {students.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl mb-4">
                📭
              </div>

              <h3 className="font-bold text-slate-700">
                Belum ada data siswa
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Data siswa PKL akan muncul di sini.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-3xl mb-4">
                🔎
              </div>

              <h3 className="font-bold text-slate-700">
                Siswa tidak ditemukan
              </h3>

              <p className="text-sm text-slate-400 mt-1">
                Coba gunakan kata kunci pencarian yang berbeda.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        No
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        NIS
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Kelas
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Jurusan
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                        Tempat PKL
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        className="border-b border-slate-50 hover:bg-blue-50/30 transition"
                      >
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold">
                              {student.nama
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <p className="font-semibold text-slate-700">
                              {student.nama}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.nis || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {student.kelas || "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.jurusan || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">
                              🏢
                            </span>

                            <span className="text-sm font-medium text-slate-700">
                              {student.tempatPkl || "-"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}
              <div className="lg:hidden divide-y divide-slate-100">
                {filteredStudents.map((student, index) => (
                  <div
                    key={student.id}
                    className="p-5 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold">
                          {student.nama
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">
                            {student.nama}
                          </h3>

                          <p className="text-xs text-slate-400 mt-0.5">
                            NIS: {student.nis || "-"}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-400">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          Kelas
                        </p>

                        <p className="text-sm font-semibold text-slate-700">
                          {student.kelas || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400 mb-1">
                          Jurusan
                        </p>

                        <p className="text-sm font-semibold text-slate-700">
                          {student.jurusan || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-600 mb-1">
                        Tempat PKL
                      </p>

                      <p className="text-sm font-bold text-emerald-700">
                        {student.tempatPkl || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
                Informasi Data Siswa
              </h3>

              <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                Data siswa ditampilkan berdasarkan data siswa PKL yang
                tersedia pada sistem. Gunakan kolom pencarian untuk
                menemukan siswa tertentu dengan lebih cepat.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Data Siswa PKL
          </p>
        </div>
      </div>
    </main>
  );
}