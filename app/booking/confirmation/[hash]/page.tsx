// /app/booking/confirmation/[hash]/page.tsx
import { Suspense } from "react";
import ConfirmationPageContent from "./confirmation-content";
import ConfirmationLoading from "../confirmation-loading";

interface ConfirmationPageProps {
  params: Promise<{
    hash: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  try {
    const { hash } = await params;

    console.log("📋 Hash recibido en params:", hash);

    return (
      <Suspense fallback={<ConfirmationLoading />}>
        <ConfirmationPageContent hash={hash} />
      </Suspense>
    );
  } catch (error) {
    console.error("❌ Error obteniendo params:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error cargando confirmación
          </h1>
          <p className="text-muted-foreground">
            Por favor, verifica tu enlace o intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }
}
