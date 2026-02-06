// /booking/pagopar-redirect/page.tsx
import { Suspense } from "react";
import PagoparRedirectContent from "./pagopar-content";
import PagoparRedirectLoading from "./pagopar-loading";

export const dynamic = "force-dynamic";

export default function PagoparRedirectPage() {
  return (
    <Suspense fallback={<PagoparRedirectLoading />}>
      <PagoparRedirectContent />
    </Suspense>
  );
}
