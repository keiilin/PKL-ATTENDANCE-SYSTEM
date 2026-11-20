
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SiswaSidebar from "@/components/layout/SiswaSidebar";

export default function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSiswa, setIsSiswa] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setIsSiswa(false);
        return;
      }

      const user = JSON.parse(storedUser);

      setIsSiswa(user?.role === "SISWA");
    } catch {
      setIsSiswa(false);
    } finally {
      setChecked(true);
    }
  }, [pathname]);

  if (!checked) {
    return <>{children}</>;
  }

  if (!isSiswa || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <>
      <SiswaSidebar />

      <main className="min-h-screen bg-slate-50 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
    </>
  );
}
