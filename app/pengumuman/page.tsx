"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
}

interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
}

export default function PengumumanPage() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const getAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/announcements");
      const data = await response.json();

      if (response.ok) {
        setAnnouncements(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAnnouncements();
    }
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            📢
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Memuat...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
              Informasi
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

            <span className="text-xs font-medium text-slate-400">
              Pengumuman
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Pengumuman 📢
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Informasi terbaru mengenai kegiatan, jadwal, dan
                pemberitahuan PKL.
              </p>
            </div>

            {announcements.length > 0 && (
              <div className="self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:self-auto">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-bold text-slate-700">
                    {announcements.length} Pengumuman
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* HERO */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-16 h-36 w-36 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl backdrop-blur-sm">
              📢
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-100">
                Informasi PKL
              </p>

              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                Jangan lewatkan informasi penting
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Pantau pengumuman terbaru dari pihak sekolah agar kamu
                tidak ketinggalan informasi selama pelaksanaan PKL.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">

          {/* TITLE */}
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-lg">
                🔔
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                  Pengumuman Terbaru
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi yang perlu kamu ketahui.
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-12 text-center sm:p-16">
              <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📢
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-600">
                Memuat pengumuman...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Tunggu sebentar ya...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            /* EMPTY */
            <div className="p-10 text-center sm:p-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-50 to-indigo-50 text-4xl">
                📭
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                Belum Ada Pengumuman
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Saat ini belum ada informasi atau pengumuman terbaru
                dari sekolah.
              </p>
            </div>
          ) : (
            /* LIST */
            <div className="space-y-4 p-4 sm:p-5">
              {announcements.map((item, index) => (
                <article
                  key={item.id}
                  className="group rounded-[22px] border border-slate-200/80 bg-[#fafbfe] p-5 transition-all duration-200 hover:border-blue-100 hover:bg-white hover:shadow-md sm:p-6"
                >
                  {/* TITLE */}
                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-lg">
                      {index === 0 ? "📌" : "📢"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">
                          <h3 className="text-base font-bold leading-snug text-slate-800 sm:text-lg">
                            {item.judul}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-400">
                              Dipublikasikan
                            </span>

                            <span className="text-xs text-slate-300">
                              •
                            </span>

                            <span className="text-xs font-semibold text-indigo-600">
                              {new Date(
                                item.createdAt
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <span className="self-start rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600">
                          INFORMASI
                        </span>
                      </div>

                      {/* CONTENT */}
                      <div className="mt-4">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
                          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                            {item.isi}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* INFO */}
        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-lg">💡</span>

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Jangan lupa cek pengumuman
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700 sm:text-sm">
                Pastikan kamu rutin memeriksa halaman pengumuman agar
                tidak melewatkan informasi penting mengenai kegiatan PKL.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="py-8 text-center">
          <p className="text-xs text-slate-400">
            PKL Attendance • Pengumuman
          </p>
        </footer>
      </div>
    </main>
  );
}