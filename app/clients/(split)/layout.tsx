import type { ReactNode } from "react";
import { clients } from "@/lib/data";
import { ClientsSplitShell } from "@/components/clients-split-shell";

export default function ClientsSplitLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <ClientsSplitShell clients={clients}>{children}</ClientsSplitShell>;
}
