import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo evaluar si el usuario entra a la raíz "/"
  if (pathname === "/") {
    // Detectar el código de país (2 letras) usando cabeceras comunes de hosting:
    // - Netlify: 'x-nf-country' o 'x-country'
    // - AWS Amplify / CloudFront: 'cloudfront-viewer-country'
    // - Vercel: 'x-vercel-ip-country'
    // - Cloudflare: 'cf-ipcountry'

    const countryHeader =
      request.headers.get("x-nf-country") ||
      request.headers.get("x-country") ||
      request.headers.get("cloudfront-viewer-country") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry");

    const country = countryHeader?.toLowerCase();

    // Redirigir según el país detectado enviando la cabecera x-detected-country para auditoría en DevTools
    const createRedirect = (destination: string) => {
      const response = NextResponse.redirect(new URL(destination, request.url));
      if (country) {
        response.headers.set("x-detected-country", country);
      }
      return response;
    };

    if (country === "br") return createRedirect("/brasil");
    if (country === "ar") return createRedirect("/argentina");
    if (country === "cl") return createRedirect("/chile");
    if (country === "co") return createRedirect("/colombia");
    if (country === "py") return createRedirect("/paraguay");
  }

  return NextResponse.next();
}

// Configurar para que el proxy solo se ejecute en la raíz "/"
export const config = {
  matcher: ["/"],
};
