"use client";

import { useEffect, useState } from "react";
import { isAppWebView, getSystemBrowserUrl } from "@/lib/webview-detector";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function WebviewWarning() {
  const [isWebview, setIsWebview] = useState(false);
  const [androidIntentUrl, setAndroidIntentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isAppWebView()) {
      setIsWebview(true);
      const intentUrl = getSystemBrowserUrl(window.location.href);
      if (intentUrl) {
        setAndroidIntentUrl(intentUrl);
      }
    }
  }, []);

  if (!isWebview) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-amber-100/95 dark:bg-amber-900/95 backdrop-blur border-b border-amber-200 dark:border-amber-700 p-3 sm:p-4 shadow-md flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between transition-all">
      <div className="flex items-start sm:items-center gap-3">
        <div className="bg-amber-200 dark:bg-amber-800 p-2 rounded-full shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-200" />
        </div>
        <div className="flex-1">
          <p className="text-amber-900 dark:text-amber-50 font-medium text-sm sm:text-base leading-tight">
            Estás usando el navegador interno de una red social.
          </p>
          <p className="text-amber-800 dark:text-amber-200/80 text-xs sm:text-sm mt-0.5">
            Para que tu pago se procese correctamente, abre esta página en el navegador de tu dispositivo.
          </p>
        </div>
      </div>
      <div className="w-full sm:w-auto shrink-0 flex gap-2">
        {androidIntentUrl ? (
          <a
            href={androidIntentUrl}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir en Chrome
          </a>
        ) : (
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-lg text-sm font-medium border border-amber-300 dark:border-amber-700">
            Toca los 3 puntos (⋮) y elige "Abrir en el navegador"
          </div>
        )}
      </div>
    </div>
  );
}
