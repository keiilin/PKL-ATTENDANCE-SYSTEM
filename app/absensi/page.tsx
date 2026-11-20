
"use client";

import { useEffect, useRef, useState } from "react";
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
};

type Schedule = {
  hari: string;
  jamMasuk: string;
  jamPulang: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function AbsensiPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusLokasi, setStatusLokasi] = useState(
    "Lokasi akan diminta saat konfirmasi presensi."
  );

  const [jamPulangJadwal, setJamPulangJadwal] =
    useState<string | null>(null);

  const [waktuSekarang, setWaktuSekarang] =
    useState(new Date());

  const [fotoMasuk, setFotoMasuk] =
    useState<File | null>(null);
  const [fotoPulang, setFotoPulang] =
    useState<File | null>(null);

  const [previewMasuk, setPreviewMasuk] =
    useState<string | null>(null);
  const [previewPulang, setPreviewPulang] =
    useState<string | null>(null);

  const fileMasukRef =
    useRef<HTMLInputElement>(null);
  const filePulangRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // WEBCAM LAPTOP
  // =====================================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [kameraAktif, setKameraAktif] =
    useState<"MASUK" | "PULANG" | null>(null);

  const [kameraLoading, setKameraLoading] =
    useState(false);

  const [alasanTerlambat, setAlasanTerlambat] =
    useState("");
  const [alasanPulangTelat, setAlasanPulangTelat] =
    useState("");

  const [showTerlambat, setShowTerlambat] =
    useState(false);
  const [showPulangTelat, setShowPulangTelat] =
    useState(false);

  // =====================================================
  // REALTIME CLOCK
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setWaktuSekarang(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // LOAD ABSENSI + JADWAL
  // =====================================================

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const attendanceRes = await fetch(
          `/api/attendance/status?userId=${user.id}`
        );

        const attendanceData =
          await attendanceRes.json();

        if (attendanceData?.attendance) {
          setAttendance(attendanceData.attendance);
        } else {
          setAttendance(null);
        }

        const scheduleRes = await fetch(
          `/api/dashboard?userId=${user.id}`
        );

        const scheduleData =
          await scheduleRes.json();

        const todaySchedule: Schedule | null =
          scheduleData?.data?.todaySchedule || null;

        if (todaySchedule?.jamPulang) {
          setJamPulangJadwal(todaySchedule.jamPulang);
        } else {
          setJamPulangJadwal(null);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil data absensi:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // =====================================================
  // BUKA WEBCAM
  // =====================================================

  const bukaKamera = async (
    jenis: "MASUK" | "PULANG"
  ) => {
    try {
      setKameraLoading(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Browser tidak mendukung akses kamera. Jalankan website melalui localhost atau HTTPS."
        );
      }

      // Hentikan kamera sebelumnya jika masih aktif
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

      streamRef.current = stream;
      setKameraAktif(jenis);
    } catch (error) {
      console.error("KAMERA ERROR:", error);

      alert(
        "Kamera tidak dapat dibuka. Pastikan webcam laptop terhubung, tidak sedang digunakan aplikasi lain, dan izin kamera browser sudah diberikan."
      );
    } finally {
      setKameraLoading(false);
    }
  };

  // =====================================================
  // HUBUNGKAN WEBCAM KE VIDEO
  // =====================================================

  useEffect(() => {
    if (
      !kameraAktif ||
      !videoRef.current ||
      !streamRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.error(
        "Gagal menjalankan video kamera:",
        error
      );
    });
  }, [kameraAktif]);

  // =====================================================
  // TUTUP WEBCAM
  // =====================================================

  const tutupKamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setKameraAktif(null);
  };

  // =====================================================
  // AMBIL FOTO DARI WEBCAM
  // =====================================================

  const ambilFotoKamera = () => {
    const video = videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      alert(
        "Kamera belum siap. Tunggu beberapa saat lalu coba kembali."
      );
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      alert("Gagal mengambil gambar dari kamera.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Gagal memproses foto.");
          return;
        }

        const file = new File(
          [blob],
          `foto-presensi-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          }
        );

        const preview = URL.createObjectURL(file);

        if (kameraAktif === "MASUK") {
          if (previewMasuk) {
            URL.revokeObjectURL(previewMasuk);
          }

          setFotoMasuk(file);
          setPreviewMasuk(preview);
        }

        if (kameraAktif === "PULANG") {
          if (previewPulang) {
            URL.revokeObjectURL(previewPulang);
          }

          setFotoPulang(file);
          setPreviewPulang(preview);
        }

        tutupKamera();
      },
      "image/jpeg",
      0.90
    );
  };

  // =====================================================
  // MATIKAN KAMERA SAAT HALAMAN DITINGGALKAN
  // =====================================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      if (previewMasuk) {
        URL.revokeObjectURL(previewMasuk);
      }

      if (previewPulang) {
        URL.revokeObjectURL(previewPulang);
      }
    };
  }, [previewMasuk, previewPulang]);

  // =====================================================
  // CEK JADWAL PULANG
  // =====================================================

  const bolehAbsenPulang = () => {
    if (!jamPulangJadwal) return true;

    const [jam, menit] =
      jamPulangJadwal.split(":").map(Number);

    const jadwal = new Date(waktuSekarang);

    jadwal.setHours(jam, menit, 0, 0);

    return waktuSekarang >= jadwal;
  };

  // =====================================================
  // HITUNG COUNTDOWN
  // =====================================================

  const getSisaWaktu = () => {
    if (!jamPulangJadwal) return null;

    const [jam, menit] =
      jamPulangJadwal.split(":").map(Number);

    const jadwal = new Date(waktuSekarang);

    jadwal.setHours(jam, menit, 0, 0);

    const selisih =
      jadwal.getTime() -
      waktuSekarang.getTime();

    if (selisih <= 0) return null;

    const totalDetik = Math.floor(
      selisih / 1000
    );

    const hours = Math.floor(totalDetik / 3600);

    const minutes = Math.floor(
      (totalDetik % 3600) / 60
    );

    const seconds = totalDetik % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  // =====================================================
  // FOTO MASUK (PILIH FILE SEBAGAI CADANGAN)
  // =====================================================

  const handleFotoMasuk = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      return;
    }

    if (previewMasuk) {
      URL.revokeObjectURL(previewMasuk);
    }

    setFotoMasuk(file);

    const preview = URL.createObjectURL(file);

    setPreviewMasuk(preview);
  };

  // =====================================================
  // FOTO PULANG (PILIH FILE SEBAGAI CADANGAN)
  // =====================================================

  const handleFotoPulang = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      return;
    }

    if (previewPulang) {
      URL.revokeObjectURL(previewPulang);
    }

    setFotoPulang(file);

    const preview = URL.createObjectURL(file);

    setPreviewPulang(preview);
  };

  // =====================================================
  // GPS DAN WATERMARK FOTO
  // =====================================================

  const ambilLokasi = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Browser ini tidak mendukung GPS/lokasi."
          )
        );
        return;
      }

      setStatusLokasi(
        "Meminta izin lokasi perangkat..."
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setStatusLokasi(
            `Lokasi berhasil diperoleh: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
          );

          resolve(coordinates);
        },
        (error) => {
          let message =
            "Lokasi tidak dapat diperoleh.";

          if (
            error.code === error.PERMISSION_DENIED
          ) {
            message =
              "Izin lokasi ditolak. Aktifkan izin lokasi pada browser untuk melakukan presensi.";
          } else if (
            error.code === error.POSITION_UNAVAILABLE
          ) {
            message =
              "Informasi lokasi tidak tersedia. Periksa GPS perangkat lalu coba lagi.";
          } else if (error.code === error.TIMEOUT) {
            message =
              "Permintaan lokasi melewati batas waktu. Coba lagi di tempat dengan sinyal GPS lebih baik.";
          }

          setStatusLokasi(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  };

  const buatFotoWatermark = async (
    file: File,
    coordinates: Coordinates,
    jenis: "MASUK" | "PULANG"
  ): Promise<File> => {
    const imageBitmap = await createImageBitmap(file);

    const canvas = document.createElement("canvas");

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const context = canvas.getContext("2d");

    if (!context) {
      imageBitmap.close();

      throw new Error(
        "Tidak dapat memproses foto pada browser ini."
      );
    }

    context.drawImage(
      imageBitmap,
      0,
      0,
      canvas.width,
      canvas.height
    );

    imageBitmap.close();

    const now = new Date();

    const tanggalJam = now.toLocaleString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const lines = [
      `PRESENSI PKL - ${jenis}`,
      tanggalJam,
      `Latitude: ${coordinates.latitude.toFixed(6)}`,
      `Longitude: ${coordinates.longitude.toFixed(6)}`,
    ];

    const fontSize = Math.max(
      16,
      Math.round(canvas.width * 0.025)
    );

    const padding = Math.max(
      12,
      Math.round(fontSize * 0.7)
    );

    const lineHeight = Math.round(
      fontSize * 1.45
    );

    context.font = `600 ${fontSize}px Arial, sans-serif`;

    const boxHeight =
      padding * 2 + lineHeight * lines.length;

    const boxWidth = Math.min(
      canvas.width - padding * 2,
      Math.max(
        ...lines.map(
          (line) => context.measureText(line).width
        )
      ) +
        padding * 2
    );

    const x = padding;
    const y = canvas.height - boxHeight - padding;

    context.fillStyle = "rgba(0, 0, 0, 0.68)";

    context.fillRect(
      x,
      Math.max(0, y),
      boxWidth,
      boxHeight
    );

    context.fillStyle = "#ffffff";
    context.textBaseline = "top";

    lines.forEach((line, index) => {
      context.fillText(
        line,
        x + padding,
        Math.max(0, y) +
          padding +
          index * lineHeight
      );
    });

    const blob: Blob = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(
                  new Error(
                    "Gagal membuat watermark pada foto."
                  )
                ),
          "image/jpeg",
          0.80
        );
      }
    );

    const safeName =
      file.name.replace(/\.[^.]+$/, "") ||
      "foto-presensi";

    return new File(
      [blob],
      `${safeName}-${jenis.toLowerCase()}.jpg`,
      {
        type: "image/jpeg",
        lastModified: Date.now(),
      }
    );
  };

  // =====================================================
  // CHECK IN
  // =====================================================

  const checkIn = async (alasan?: string) => {
    if (!user?.id) return;

    if (!fotoMasuk) {
      alert("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      setProcessing(true);

      const coordinates = await ambilLokasi();

      const fotoDenganWatermark =
        await buatFotoWatermark(
          fotoMasuk,
          coordinates,
          "MASUK"
        );

      const formData = new FormData();

      formData.append("userId", String(user.id));
      formData.append("foto", fotoDenganWatermark);

      formData.append(
        "latitude",
        String(coordinates.latitude)
      );

      formData.append(
        "longitude",
        String(coordinates.longitude)
      );

      if (alasan) {
        formData.append(
          "alasanTerlambat",
          alasan
        );
      }

      const response = await fetch(
        "/api/attendance/check-in",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.perluAlasan) {
        setShowTerlambat(true);
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal melakukan absen masuk."
        );
        return;
      }

      alert("Absen masuk berhasil!");

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat melakukan absen masuk."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // CHECK OUT
  // =====================================================

  const checkOut = async (alasan?: string) => {
    if (!user?.id) return;

    if (!fotoPulang) {
      alert("Silakan ambil foto terlebih dahulu.");
      return;
    }

    try {
      setProcessing(true);

      const coordinates = await ambilLokasi();

      const fotoDenganWatermark =
        await buatFotoWatermark(
          fotoPulang,
          coordinates,
          "PULANG"
        );

      const formData = new FormData();

      formData.append("userId", String(user.id));
      formData.append("foto", fotoDenganWatermark);

      formData.append(
        "latitude",
        String(coordinates.latitude)
      );

      formData.append(
        "longitude",
        String(coordinates.longitude)
      );

      if (alasan) {
        formData.append(
          "alasanPulangTelat",
          alasan
        );
      }

      const response = await fetch(
        "/api/attendance/check-out",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.perluAlasan) {
        setShowPulangTelat(true);
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal melakukan absen pulang."
        );
        return;
      }

      alert("Absen pulang berhasil!");

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat melakukan absen pulang."
      );
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // FORMAT
  // =====================================================

  const formatWaktu = (
    tanggal: string | Date
  ) => {
    return new Date(tanggal).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  const formatTanggal = (
    tanggal: string | Date
  ) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            📋
          </div>

          <h2 className="font-bold text-slate-800">
            Memuat halaman absensi
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tunggu sebentar ya...
          </p>
        </div>
      </main>
    );
  }

  const sisaWaktu = getSisaWaktu();

  const sudahMasuk =
    Boolean(attendance?.jamMasuk);

  const sudahPulang =
    Boolean(attendance?.jamPulang);

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Presensi</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">
              Absensi Hari Ini
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
            Presensi PKL 📋
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Catat kehadiran PKL kamu dengan foto
            dan waktu presensi yang sesuai.
          </p>
        </div>

        {/* HERO */}

        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                📋 PRESENSI HARIAN
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                Selamat datang, {user?.nama || "Siswa"} 👋
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Jangan lupa melakukan presensi masuk
                dan pulang sesuai dengan jadwal PKL kamu.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm lg:min-w-[250px]">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Waktu Sekarang
              </p>

              <p className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                {formatWaktu(waktuSekarang)}
              </p>

              <p className="mt-1 text-sm text-blue-100">
                {formatTanggal(waktuSekarang)}
              </p>
            </div>
          </div>
        </section>

        {/* STATUS CARDS */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Status Hari Ini
                </p>

                <h3 className="mt-2 text-lg font-black text-slate-800">
                  {sudahPulang
                    ? "Selesai"
                    : sudahMasuk
                    ? "Sedang PKL"
                    : "Belum Absen"}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${
                  sudahPulang
                    ? "bg-emerald-50"
                    : sudahMasuk
                    ? "bg-blue-50"
                    : "bg-amber-50"
                }`}
              >
                {sudahPulang ? "✓" : sudahMasuk ? "⏱️" : "!"}
              </div>
            </div>

            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                sudahPulang
                  ? "bg-emerald-50 text-emerald-700"
                  : sudahMasuk
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {sudahPulang
                ? "Presensi lengkap"
                : sudahMasuk
                ? "Sudah absen masuk"
                : "Menunggu presensi"}
            </span>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Jam Masuk
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-800">
                  {attendance?.jamMasuk
                    ? formatWaktu(attendance.jamMasuk)
                    : "--:--:--"}
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                🌅
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Waktu presensi masuk
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Jam Pulang
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-800">
                  {attendance?.jamPulang
                    ? formatWaktu(attendance.jamPulang)
                    : "--:--:--"}
                </h3>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                🌙
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Waktu presensi pulang
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">

          {/* JADWAL */}

          <div className="lg:col-span-2">
            <div className="h-full rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  ⏰
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Jadwal Hari Ini
                  </h2>

                  <p className="text-sm text-slate-500">
                    Waktu presensi PKL
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-[#f7f9fc] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Jadwal Pulang
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-800">
                    {jamPulangJadwal || "--:--"}
                  </span>

                  {jamPulangJadwal && (
                    <span className="mb-1 text-sm font-medium text-slate-400">
                      WIB
                    </span>
                  )}
                </div>
              </div>

              {!sudahMasuk && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>

                    <div>
                      <p className="font-bold text-blue-800">
                        Belum melakukan absen masuk
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        Siapkan kamera untuk melakukan presensi.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {sudahMasuk && !sudahPulang && (
                <div className="mt-4">
                  {!bolehAbsenPulang() ? (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <span className="text-xl">🔒</span>

                        <div>
                          <p className="font-bold text-amber-800">
                            Absen pulang belum tersedia
                          </p>

                          <p className="mt-1 text-sm leading-6 text-amber-700">
                            Kamu dapat melakukan absen pulang
                            setelah jadwal selesai.
                          </p>

                          {sisaWaktu && (
                            <div className="mt-3 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-black text-amber-700 shadow-sm">
                              ⏳ {sisaWaktu}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <div className="flex gap-3">
                        <span className="text-xl">🔓</span>

                        <div>
                          <p className="font-bold text-emerald-800">
                            Sudah waktunya absen pulang
                          </p>

                          <p className="mt-1 text-sm text-emerald-700">
                            Silakan lakukan presensi pulang.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ABSEN MASUK */}

          {!sudahMasuk && (
            <div className="lg:col-span-3">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                      🌅
                    </div>

                    <div>
                      <h2 className="font-black text-slate-800">
                        Absen Masuk
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Ambil foto untuk mencatat kehadiran
                      </p>
                    </div>
                  </div>

                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">
                    CHECK IN
                  </span>
                </div>

                <div className="mt-6">
                  <input
                    ref={fileMasukRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoMasuk}
                    className="hidden"
                  />

                  {!previewMasuk ? (
                    <button
                      type="button"
                      disabled={kameraLoading}
                      onClick={() => bukaKamera("MASUK")}
                      className="group w-full rounded-[24px] border-2 border-dashed border-slate-200 bg-[#f9fafc] px-6 py-10 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition group-hover:scale-105">
                        📷
                      </div>

                      <p className="mt-4 font-black text-slate-700">
                        Ambil Foto Presensi
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Webcam laptop akan dibuka langsung
                      </p>

                      <span className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
                        {kameraLoading ? "Membuka Kamera..." : "Buka Kamera"}
                      </span>
                    </button>
                  ) : (
                    <div className="overflow-hidden rounded-[24px] bg-slate-900">
                      <img
                        src={previewMasuk}
                        alt="Preview foto masuk"
                        className="max-h-[360px] w-full object-cover"
                      />

                      <div className="flex flex-col gap-2 p-3 sm:flex-row">
                        <button
                          type="button"
                          disabled={kameraLoading}
                          onClick={() => bukaKamera("MASUK")}
                          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          🔄 Ganti Foto
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (previewMasuk) {
                              URL.revokeObjectURL(previewMasuk);
                            }

                            setFotoMasuk(null);
                            setPreviewMasuk(null);

                            if (fileMasukRef.current) {
                              fileMasukRef.current.value = "";
                            }
                          }}
                          className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!fotoMasuk || processing}
                  onClick={() => checkIn()}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3.5 font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Memproses..."
                    : "✓ Konfirmasi Absen Masuk"}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Maksimal ukuran foto 5 MB
                </p>

                <p
                  className="mt-2 text-center text-xs text-slate-500"
                  aria-live="polite"
                >
                  📍 {statusLokasi}
                </p>
              </div>
            </div>
          )}

          {/* ABSEN PULANG */}

          {sudahMasuk && !sudahPulang && (
            <div className="lg:col-span-3">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl">
                      🌙
                    </div>

                    <div>
                      <h2 className="font-black text-slate-800">
                        Absen Pulang
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Selesaikan presensi hari ini
                      </p>
                    </div>
                  </div>

                  <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 sm:inline-flex">
                    CHECK OUT
                  </span>
                </div>

                <div className="mt-6">
                  <input
                    ref={filePulangRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoPulang}
                    className="hidden"
                  />

                  {!previewPulang ? (
                    <button
                      type="button"
                      disabled={
                        !bolehAbsenPulang() ||
                        kameraLoading
                      }
                      onClick={() => bukaKamera("PULANG")}
                      className="group w-full rounded-[24px] border-2 border-dashed border-slate-200 bg-[#f9fafc] px-6 py-10 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                        📷
                      </div>

                      <p className="mt-4 font-black text-slate-700">
                        {bolehAbsenPulang()
                          ? "Ambil Foto Pulang"
                          : "Belum Waktunya Absen Pulang"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {bolehAbsenPulang()
                          ? "Webcam laptop akan dibuka langsung"
                          : `Tersedia mulai pukul ${jamPulangJadwal || "--:--"}`}
                      </p>

                      {bolehAbsenPulang() && (
                        <span className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
                          {kameraLoading ? "Membuka Kamera..." : "Buka Kamera"}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="overflow-hidden rounded-[24px] bg-slate-900">
                      <img
                        src={previewPulang}
                        alt="Preview foto pulang"
                        className="max-h-[360px] w-full object-cover"
                      />

                      <div className="flex flex-col gap-2 p-3 sm:flex-row">
                        <button
                          type="button"
                          disabled={kameraLoading}
                          onClick={() => bukaKamera("PULANG")}
                          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          🔄 Ganti Foto
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (previewPulang) {
                              URL.revokeObjectURL(previewPulang);
                            }

                            setFotoPulang(null);
                            setPreviewPulang(null);

                            if (filePulangRef.current) {
                              filePulangRef.current.value = "";
                            }
                          }}
                          className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={
                    !fotoPulang ||
                    processing ||
                    !bolehAbsenPulang()
                  }
                  onClick={() => checkOut()}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3.5 font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing
                    ? "Memproses..."
                    : "✓ Konfirmasi Absen Pulang"}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Maksimal ukuran foto 5 MB
                </p>

                <p
                  className="mt-2 text-center text-xs text-slate-500"
                  aria-live="polite"
                >
                  📍 {statusLokasi}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SELESAI */}

        {sudahMasuk && sudahPulang && (
          <section className="mt-5">
            <div className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm sm:p-8">
              <div className="mx-auto max-w-xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-4xl">
                  🎉
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-800">
                  Presensi Hari Ini Selesai!
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Kamu sudah melakukan absen masuk
                  dan absen pulang. Terima kasih
                  sudah disiplin melakukan presensi PKL.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-400">
                      Jam Masuk
                    </p>

                    <p className="mt-1 font-black text-emerald-600">
                      {formatWaktu(attendance!.jamMasuk!)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-400">
                      Jam Pulang
                    </p>

                    <p className="mt-1 font-black text-indigo-600">
                      {formatWaktu(attendance!.jamPulang!)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* INFO */}

        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-sm">
              💡
            </div>

            <div>
              <p className="font-bold text-blue-900">
                Catatan Presensi
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Pastikan foto presensi terlihat jelas.
                Jika melakukan presensi terlambat atau
                pulang melewati jadwal, sistem akan
                meminta alasan sebelum presensi dilanjutkan.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL TERLAMBAT */}

        {showTerlambat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                ⚠️
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-800">
                Kamu Terlambat Absen
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Silakan tuliskan alasan keterlambatan
                sebelum melanjutkan presensi.
              </p>

              <textarea
                value={alasanTerlambat}
                onChange={(e) =>
                  setAlasanTerlambat(e.target.value)
                }
                placeholder="Contoh: Terjadi kendala perjalanan..."
                rows={4}
                className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTerlambat(false);
                    setAlasanTerlambat("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={
                    !alasanTerlambat.trim() ||
                    processing
                  }
                  onClick={() => {
                    setShowTerlambat(false);
                    checkIn(alasanTerlambat.trim());
                  }}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kirim Alasan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PULANG TELAT */}

        {showPulangTelat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                🕐
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-800">
                Pulang Melebihi Jadwal
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu melakukan absen pulang setelah
                jadwal yang ditentukan. Silakan
                tuliskan alasannya.
              </p>

              <textarea
                value={alasanPulangTelat}
                onChange={(e) =>
                  setAlasanPulangTelat(e.target.value)
                }
                placeholder="Contoh: Masih menyelesaikan tugas dari pembimbing..."
                rows={4}
                className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPulangTelat(false);
                    setAlasanPulangTelat("");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={
                    !alasanPulangTelat.trim() ||
                    processing
                  }
                  onClick={() => {
                    setShowPulangTelat(false);
                    checkOut(alasanPulangTelat.trim());
                  }}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Kirim Alasan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL WEBCAM */}

        {kameraAktif && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

              <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
                <div>
                  <h2 className="font-black">
                    Kamera Presensi
                  </h2>

                  <p className="text-xs text-slate-300">
                    Presensi{" "}
                    {kameraAktif === "MASUK"
                      ? "Masuk"
                      : "Pulang"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={tutupKamera}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/20"
                >
                  ✕ Tutup
                </button>
              </div>

              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full object-cover"
                />

                <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white">
                  📷 LIVE CAMERA
                </div>
              </div>

              <div className="flex flex-col gap-3 p-5 sm:flex-row">
                <button
                  type="button"
                  onClick={tutupKamera}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={ambilFotoKamera}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
                >
                  📸 Ambil Foto
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
