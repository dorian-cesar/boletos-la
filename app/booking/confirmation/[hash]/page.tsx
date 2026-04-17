"use client";

import { use, useState } from "react";
import ConfirmationLoading from "../confirmation-loading";
import ConfirmationPageContent from "./confirmation-content";

interface ConfirmationPageProps {
  params: Promise<{ hash: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { hash } = use(params);
  const [ready, setReady] = useState<{
    paymentDetails: any;
    isTarjetaPayment: boolean;
  } | null>(null);

  if (!ready) {
    return (
      <ConfirmationLoading
        hash={hash}
        onReady={(paymentDetails, isTarjeta) =>
          setReady({ paymentDetails, isTarjetaPayment: isTarjeta })
        }
      />
    );
  }

  return (
    <ConfirmationPageContent
      hash={hash}
      paymentDetails={ready.paymentDetails}
      isTarjetaPayment={ready.isTarjetaPayment}
    />
  );
}
