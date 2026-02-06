import { Suspense } from "react";
import ConfirmationPageContent from "./confirmation-content";
import ConfirmationLoading from "./confirmation-loading";

export const dynamic = "force-dynamic";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationPageContent />
    </Suspense>
  );
}
