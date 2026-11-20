import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

function readCoordinate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validCoordinates(latitude: number | null, longitude: number | null) {
  return latitude !== null && longitude !== null &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = Number(formData.get("userId"));
    const alasanTerlambat = String(formData.get("alasanTerlambat") || "").trim() || null;
    const foto = formData.get("foto");
    const latitude = readCoordinate(formData.get("latitude"));
    const longitude = readCoordinate(formData.get("longitude"));

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ message: "User ID tidak valid" }, { status: 400 });
    }

    if (!validCoordinates(latitude, longitude)) {
      return NextResponse.json({ message: "Koordinat GPS tidak valid. Izinkan akses lokasi lalu coba kembali." }, { status: 400 });
    }

    if (!(foto instanceof File) || foto.size === 0) {
      return NextResponse.json({ message: "Foto presensi wajib dilampirkan." }, { status: 400 });
    }

    if (!foto.type.startsWith("image/")) {
      return NextResponse.json({ message: "File yang dikirim harus berupa gambar." }, { status: 400 });
    }

    if (foto.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "Ukuran foto maksimal 5 MB." }, { status: 400 });
    }

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          message: "Kamu sudah melakukan absensi masuk hari ini.",
        },
        { status: 400 }
      );
    }

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const schedule = await prisma.schedule.findFirst({
      where: {
        userId,
        hari: days[now.getDay()],
      },
    });

    let status = "HADIR";

    if (schedule) {
      const [hour, minute] = schedule.jamMasuk
        .split(":")
        .map(Number);

      const scheduleTime = new Date(now);

      scheduleTime.setHours(hour, minute, 0, 0);

      if (now > scheduleTime) {
        status = "TERLAMBAT";
      }
    }

    if (status === "TERLAMBAT" && !alasanTerlambat) {
      return NextResponse.json(
        {
          message: "Kamu terlambat. Silakan masukkan alasan keterlambatan.",
          perluAlasan: true,
        },
        { status: 400 }
      );
    }

    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "attendance"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const fileName = `masuk-${userId}-${Date.now()}.jpg`;

    await fs.writeFile(
      path.join(uploadDir, fileName),
      buffer
    );

    const fotoMasuk = `/uploads/attendance/${fileName}`;

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        tanggal: now,
        jamMasuk: now,
        status,
        alasanTerlambat:
          status === "TERLAMBAT"
            ? alasanTerlambat
            : null,
        fotoMasuk,
        latitudeMasuk: latitude!,
        longitudeMasuk: longitude!,
      },
    });

    return NextResponse.json({
      message:
        status === "TERLAMBAT"
          ? "Absensi masuk berhasil. Kamu tercatat terlambat."
          : "Absensi masuk berhasil.",
      data: attendance,
    });
  } catch (error) {
    console.error("CHECK-IN ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}