import { Suspense } from "react";
import ConfirmationPageContent from "./confirmation-content";
import ConfirmationLoading from "../confirmation-loading";

interface ConfirmationPageProps {
  params: Promise<{
    hash: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { hash } = await params;

  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationPageContent hash={hash} />
    </Suspense>
  );
}
