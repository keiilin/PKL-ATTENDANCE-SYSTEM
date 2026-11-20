
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Siswa = {
  id: number;
  nama: string;
  nis: string | null;
  kelas: string | null;
  jurusan: string | null;
  tempatPkl: string | null;
};

type TempatPKL = {
  id: number;
  nama: string;
  bidang: string;
  alamat: string;
  kecamatan: string | null;
  kabupatenKota: string;
  telepon: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  statusVerifikasi: string;
  statusPenerimaan: string;
  jumlahSiswa: number;
  daftarSiswa: Siswa[];
};

export default function KetuaJurusanTempatPKLPage() {
  const router = useRouter();

  const [data, setData] = useState<TempatPKL[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TempatPKL | null>(null);

  // =========================
  // AMBIL DATA TEMPAT PKL
  // =========================
  const getData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/ketua-jurusan/tempat-pkl");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data.");
      }

      setData(result.data || []);
    } catch (error) {
      console.error("Gagal mengambil data tempat PKL:", error);
      alert("Gagal memuat data tempat PKL.");
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // CEK LOGIN DAN HAK AKSES
  // =========================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "KETUA_JURUSAN") {
        router.push("/login");
        return;
      }

      getData();
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router, getData]);

  // =========================
  // PENCARIAN TEMPAT PKL
  // =========================
  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return data;

    return data.filter((item) =>
      [
        item.nama,
        item.bidang,
        item.alamat,
        item.kecamatan,
        item.kabupatenKota,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [data, search]);

  // =========================
  // STATISTIK
  // =========================
  const totalSiswa = data.reduce(
    (total, item) => total + item.jumlahSiswa,
    0
  );

  const formatStatus = (status: string) => {
    return status.replaceAll("_", " ");
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">
              Ketua Jurusan / Tempat PKL
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Data Tempat PKL
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Informasi perusahaan dan instansi tempat siswa melaksanakan PKL.
            </p>
          </div>

          <button
            onClick={getData}
            disabled={loading}
            className="rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Refresh Data
          </button>
        </div>

        {/* HERO */}
        <section className="rounded-[28px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-lg shadow-blue-100 mb-6">
          <div className="text-4xl mb-3">🏢</div>

          <h2 className="text-2xl sm:text-3xl font-bold">
            Informasi Mitra PKL
          </h2>

          <p className="text-sm sm:text-base text-blue-100 mt-2 max-w-2xl leading-relaxed">
            Halaman ini menampilkan informasi tempat pelaksanaan PKL,
            status verifikasi, status penerimaan, dan siswa yang terdaftar
            pada masing-masing instansi.
          </p>
        </section>

        {/* STATISTIK */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              🏢
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {data.length}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Total Tempat PKL
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
              👨‍🎓
            </div>

            <p className="text-2xl font-bold text-slate-800 mt-4">
              {totalSiswa}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Siswa Terdaftar
            </p>
          </div>
        </div>

        {/* PENCARIAN */}
        <section className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 mb-6">
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            Cari Tempat PKL
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama perusahaan, bidang, atau lokasi..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          />

          <p className="text-xs text-slate-400 mt-3">
            Ditemukan {filteredData.length} tempat PKL.
          </p>
        </section>

        {/* DAFTAR TEMPAT PKL */}
        {loading ? (
          <div className="bg-white rounded-[24px] p-12 text-center text-slate-500">
            Memuat data tempat PKL...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center">
            <div className="text-4xl mb-3">📭</div>

            <h3 className="font-bold text-slate-700">
              Data tempat PKL tidak ditemukan
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Coba gunakan kata kunci pencarian yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                    🏢
                  </div>

                  <span
                    className={`text-[10px] font-bold rounded-full px-3 py-1.5 ${
                      item.statusVerifikasi === "TERVERIFIKASI"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {formatStatus(item.statusVerifikasi)}
                  </span>
                </div>

                <h2 className="font-bold text-slate-800 text-lg mt-4">
                  {item.nama}
                </h2>

                <p className="text-sm text-blue-600 font-medium mt-1">
                  {item.bidang}
                </p>

                <div className="space-y-3 mt-5">
                  <div className="flex gap-3">
                    <span>📍</span>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.alamat}
                      {item.kecamatan ? `, ${item.kecamatan}` : ""}
                      {item.kabupatenKota
                        ? `, ${item.kabupatenKota}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span>📞</span>

                    <p className="text-sm text-slate-600">
                      {item.telepon || "Nomor telepon belum tersedia"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <span>✉️</span>

                    <p className="text-sm text-slate-600 break-all">
                      {item.email || "Email belum tersedia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 mt-5 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Siswa terdaftar
                    </p>

                    <p className="font-bold text-slate-800 mt-1">
                      {item.jumlahSiswa} siswa
                    </p>
                  </div>

                  <button
                    onClick={() => setSelected(item)}
                    className="rounded-xl bg-blue-50 text-blue-700 px-4 py-2.5 text-sm font-semibold hover:bg-blue-100 transition"
                  >
                    Detail →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* MODAL DETAIL */}
        {selected && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-[28px] shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold text-blue-600">
                    DETAIL TEMPAT PKL
                  </p>

                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    {selected.nama}
                  </h2>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Bidang", selected.bidang],
                  ["Alamat", selected.alamat],
                  ["Kecamatan", selected.kecamatan || "-"],
                  ["Kabupaten/Kota", selected.kabupatenKota],
                  ["Telepon", selected.telepon || "-"],
                  ["Email", selected.email || "-"],
                  ["Status Verifikasi", formatStatus(selected.statusVerifikasi)],
                  ["Status Penerimaan", formatStatus(selected.statusPenerimaan)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <p className="text-xs text-slate-400">{label}</p>

                    <p className="text-sm font-semibold text-slate-700 mt-1 break-words">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-slate-800 mb-3">
                  Daftar Siswa ({selected.daftarSiswa.length})
                </h3>

                {selected.daftarSiswa.length === 0 ? (
                  <p className="text-sm text-slate-400 bg-slate-50 rounded-2xl p-4">
                    Belum ada siswa yang terdaftar di tempat ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selected.daftarSiswa.map((siswa, index) => (
                      <div
                        key={siswa.id}
                        className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {siswa.nama}
                          </p>

                          <p className="text-xs text-slate-400">
                            {siswa.nis || "-"} • {siswa.kelas || "-"} •{" "}
                            {siswa.jurusan || "-"}
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

        {/* INFO */}
        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm">
              💡
            </div>

            <div>
              <h3 className="font-bold text-blue-900">
                Informasi Data Tempat PKL
              </h3>

              <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                Data tempat PKL ditampilkan berdasarkan informasi yang
                tersimpan pada database. Jumlah siswa dihitung dari nama
                tempat PKL yang tercatat pada akun siswa.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Data Tempat PKL Ketua Jurusan
          </p>
        </div>
      </div>
    </main>
  );
}
