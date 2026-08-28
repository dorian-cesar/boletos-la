"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FB_PIXEL_ID,
  isPixelAllowed,
  trackPageView,
  getOrCreateExternalId,
} from "@/lib/meta-pixel";

function PixelNavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // Evitar duplicar el primer PageView que se dispara al inicializar el script
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  const [allowed, setAllowed] = useState(false);
  const [externalId, setExternalId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isPixelAllowed()) {
      setAllowed(true);
      setExternalId(getOrCreateExternalId());
    }
  }, []);

  if (!allowed) {
    return null;
  }

  const externalIdObj = externalId ? { external_id: externalId } : {};

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}', ${JSON.stringify(externalIdObj)});
            fbq('track', 'PageView', {}, { eventID: 'pv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) });
          `,
        }}
      />
      <PixelNavigationTracker />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
