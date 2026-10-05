import type { ReactNode } from "react";

import { PublicHeader } from "@/components/header/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}
