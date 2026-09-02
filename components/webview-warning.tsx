"use client";

import { useEffect, useState } from "react";
import { isAppWebView, getSystemBrowserUrl } from "@/lib/webview-detector";
import { ShieldAlert, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, []);

  if (!isWebview) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-white dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-6">
        <ShieldAlert className="h-12 w-12 text-amber-600 dark:text-amber-500" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Navegador No Compatible
      </h2>
      
      <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-sm text-base sm:text-lg leading-relaxed">
        Estás usando el navegador interno de una red social. Por motivos de seguridad bancaria (3D Secure), 
        <strong> debes abrir esta página en tu navegador principal </strong> 
        para procesar tu pago correctamente.
      </p>

      {androidIntentUrl ? (
        <Button asChild size="lg" className="w-full max-w-xs font-semibold h-14 text-base shadow-lg hover:shadow-xl transition-all">
          <a href={androidIntentUrl}>
            <ExternalLink className="mr-2 h-5 w-5" />
            Abrir en Google Chrome
          </a>
        </Button>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 shadow-sm text-left">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mb-4 text-center">
            Sigue estos pasos para continuar:
          </p>
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg shrink-0">
              <MoreVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Toca el menú superior de opciones y selecciona <strong className="text-slate-900 dark:text-white">"Abrir en el navegador"</strong> o <strong className="text-slate-900 dark:text-white">"Open in Browser"</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
