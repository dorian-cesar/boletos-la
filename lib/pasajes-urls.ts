import fs from 'fs';
import path from 'path';

export interface PasajeRoute {
  url: string;
  origenSlug: string;
  destinoSlug: string;
  origenName: string;
  destinoName: string;
}

/**
 * Convierte un slug como "ciudad-del-este" o "bella-vista-norte" a Nombre Legible "Ciudad Del Este"
 */
export function formatCityName(slug: string): string {
  if (!slug) return '';
  
  // Excepciones conocidas con tildes o formato especial
  const specialNames: Record<string, string> = {
    'asuncion': 'Asunción',
    'concepcion': 'Concepción',
    'encarnacion': 'Encarnación',
    'san-lorenzo': 'San Lorenzo',
    'salto-del-guaira': 'Salto del Guairá',
    'coronel-oviedo': 'Coronel Oviedo',
    'eusebio-ayala': 'Eusebio Ayala',
    'santa-rosa-del-aguaray': 'Santa Rosa del Aguaray',
    'bella-vista-norte': 'Bella Vista Norte',
    'capitan-bado': 'Capitán Bado',
    'foz-de-iguazu': 'Foz de Iguazú',
    'buenos-aires': 'Buenos Aires',
    'caaguazu': 'Caaguazú',
    'caacupe': 'Caacupé',
    'itaugua': 'Itauguá',
    'paraguari': 'Paraguarí',
    'tacuati': 'Tacuatí',
    'santani': 'San Estanislao (Santaní)',
    'pedro-juan-caballero': 'Pedro Juan Caballero'
  };

  if (specialNames[slug.toLowerCase()]) {
    return specialNames[slug.toLowerCase()];
  }

  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Lee el archivo url.txt y extrae todas las rutas dinamicas /pasajes/[origen]/[destino]
 */
export function getPasajesRoutes(): PasajeRoute[] {
  try {
    const filePath = path.join(process.cwd(), 'url.txt');
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    const routes: PasajeRoute[] = [];

    for (const line of lines) {
      if (line.toUpperCase() === 'URL') continue;

      try {
        const parsedUrl = new URL(line);
        const parts = parsedUrl.pathname.split('/').filter(Boolean);

        // Formato esperado: pasajes / [origen] / [destino]
        if (parts.length >= 3 && parts[0] === 'pasajes') {
          const origenSlug = parts[1];
          const destinoSlug = parts[2];

          routes.push({
            url: line,
            origenSlug,
            destinoSlug,
            origenName: formatCityName(origenSlug),
            destinoName: formatCityName(destinoSlug)
          });
        }
      } catch (err) {
        // Ignorar lineas malformadas si existieran
      }
    }

    return routes;
  } catch (error) {
    console.error('Error al leer las rutas de pasajes desde url.txt:', error);
    return [];
  }
}
