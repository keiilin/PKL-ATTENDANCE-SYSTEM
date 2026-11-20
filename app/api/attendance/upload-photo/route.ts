import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { message: "Foto tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File yang dikirim harus berupa gambar." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Ukuran foto maksimal 5 MB." },
        { status: 400 }
      );
    }

    const extensionByType: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = extensionByType[file.type];

    if (!extension) {
      return NextResponse.json(
        { message: "Format foto harus JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "attendance"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const fileName = `attendance-${Date.now()}-${randomUUID()}${extension}`;

    await writeFile(
      path.join(uploadDir, fileName),
      buffer
    );

    return NextResponse.json({
      message: "Foto berhasil diupload",
      url: `/uploads/attendance/${fileName}`,
    });
  } catch (error) {
    console.error("UPLOAD PHOTO ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat upload foto" },
      { status: 500 }
    );
  }
}