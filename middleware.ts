import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo evaluar si el usuario entra a la raíz "/"
  if (pathname === '/') {
    // Detectar el código de país (2 letras) usando cabeceras comunes de hosting:
    // - Netlify: 'x-nf-country' o 'x-country'
    // - AWS Amplify / CloudFront: 'cloudfront-viewer-country'
    // - Vercel: 'x-vercel-ip-country'
    // - Cloudflare: 'cf-ipcountry'
    const countryHeader = 
      request.headers.get('x-nf-country') || 
      request.headers.get('x-country') ||
      request.headers.get('cloudfront-viewer-country') ||
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry');

    const country = countryHeader?.toLowerCase();

    // Redirigir según el país detectado
    if (country === 'br') {
      return NextResponse.redirect(new URL('/brasil', request.url));
    }
    if (country === 'ar') {
      return NextResponse.redirect(new URL('/argentina', request.url));
    }
    if (country === 'cl') {
      return NextResponse.redirect(new URL('/chile', request.url));
    }
    if (country === 'co') {
      return NextResponse.redirect(new URL('/colombia', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar para que el middleware solo se ejecute en la raíz "/"
export const config = {
  matcher: ['/'],
};
