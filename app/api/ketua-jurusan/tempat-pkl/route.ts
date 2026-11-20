
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Mengambil seluruh data tempat PKL
    const tempatPKL = await prisma.tempatPKL.findMany({
      orderBy: {
        nama: "asc",
      },
    });

    // Mengambil siswa yang sudah memiliki tempat PKL
    const siswa = await prisma.user.findMany({
      where: {
        role: "SISWA",
        aktif: true,
        tempatPkl: {
          not: null,
        },
      },
      select: {
        id: true,
        nama: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    // Menggabungkan data tempat PKL dengan daftar siswa
    const data = tempatPKL.map((tempat) => {
      const daftarSiswa = siswa.filter(
        (item) =>
          item.tempatPkl?.trim().toLowerCase() ===
          tempat.nama.trim().toLowerCase()
      );

      return {
        ...tempat,
        jumlahSiswa: daftarSiswa.length,
        daftarSiswa,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET KETUA JURUSAN TEMPAT PKL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data tempat PKL.",
      },
      { status: 500 }
    );
  }
}
