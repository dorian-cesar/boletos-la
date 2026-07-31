import React from "react";
import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";

export default function ParaguayBookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ParaguayHeader />
      <main className="flex-1 bg-muted/30">{children}</main>
      <ParaguayFooter />
    </div>
  );
}
