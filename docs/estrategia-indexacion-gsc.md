# Estrategia de Indexación Dinámica y Pasos en Google Search Console para Boletos.la

Este documento reúne la estrategia técnica implementada en **Next.js App Router** para indexar las 350+ URLs dinámicas de `url.txt` en el dominio `boletos.la`, junto con los pasos operativos para **Google Search Console** e **IndexNow**.

---

## Parte 1: Estrategia de Arquitectura SEO e Implementación Técnica

### 1. Lectura Dinámica de Rutas (`lib/pasajes-urls.ts`)
- Se implementó la utilidad `getPasajesRoutes()` que lee directamente el archivo `url.txt`.
- Extrae los slugs de origen y destino (`/pasajes/[origen]/[destino]`).
- Formatea y añade las excepciones de acentuación para ciudades de Paraguay, Brasil y Argentina (`formatCityName()`).

### 2. Generación Estática y Metadatos Dinámicos (`app/pasajes/[origen]/[destino]/page.tsx`)
- **Pre-renderizado (SSG)**: Utiliza `generateStaticParams()` para construir estáticamente las 350+ rutas durante el despliegue.
- **Metadatos dinámicos**: `generateMetadata()` asigna títulos específicos, metadescripciones orientadas a búsqueda de pasajes y la etiqueta `<link rel="canonical" href="https://boletos.la/pasajes/[origen]/[destino]" />`.
- **Datos Estructurados (Schema.org)**: Incluye JSON-LD de tipo `BusTrip` / `Trip` para habilitar *Rich Snippets* (precios y horarios destacados) en los resultados de Google.
- **Enlazado Interno (Internal Linking)**: Muestra bloques de *"Más salidas desde [Origen]"* y *"Otros pasajes con destino a [Destino]"* para distribuir la autoridad y ayudar al rastreo de los bots.

### 3. Sitemap y Robots.txt Dinámicos
- **`app/sitemap.ts`**: Expone `https://boletos.la/sitemap.xml` integrando automáticamente todas las rutas estáticas y las 350+ rutas dinámicas con frecuencia diaria (`changeFrequency: 'daily'`) y prioridad `0.8`.
- **`app/robots.ts`**: Expone `https://boletos.la/robots.txt` autorizando a todos los buscadores e indicando el sitemap oficial.

### 4. Herramienta CLI de Notificación Lote (`scripts/index-urls.js`)
- Permite ejecutar una prueba (`--dry-run`) o enviar directamente las URLs a la API de **IndexNow** (Bing / Yandex) o configurar la **Google Indexing API**.

---

## Parte 2: Pasos Operativos en Google Search Console

Una vez desplegada la aplicación a producción (`https://boletos.la`), sigue estos pasos dentro de Google Search Console:

### Paso 1: Registrar o Seleccionar la Propiedad
1. Accede a [Google Search Console](https://search.google.com/search-console).
2. Asegúrate de estar dentro de la propiedad **`boletos.la`** (o `https://boletos.la`).

### Paso 2: Enviar el Sitemap XML
1. En el menú lateral izquierdo, ingresa a **Indexación > Sitemaps**.
2. En el campo *"Añadir un nuevo sitemap"*, escribe:
   ```text
   sitemap.xml
   ```
3. Haz clic en **Enviar**.
4. Recarga la página tras unos momentos y verifica que el estado sea **"Correcto"** y muestre aproximadamente **356 URLs descubiertas**.

### Paso 3: Realizar Prueba en Directo y Solicitar Indexación Semilla
1. En la barra de búsqueda superior (*"Inspeccionar cualquier URL..."*), pega una ruta de prueba:
   ```text
   https://boletos.la/pasajes/asuncion/ciudad-del-este
   ```
2. Haz clic en **Probar URL en directo**.
3. Confirma que devuelva:
   - ✅ Estado HTTP: **200 OK**.
   - ✅ Canónica seleccionada por el usuario: `https://boletos.la/pasajes/asuncion/ciudad-del-este`.
   - ✅ Datos estructurados detectados: `BusTrip`.
4. Haz clic en **Solicitar indexación**. Esto servirá como disparador inicial para que el bot de Google empiece a descubrir el resto del árbol de enlaces.

### Paso 4: Monitoreo de Cobertura
1. En el menú lateral, dirígete a **Indexación > Páginas**.
2. Supervisa el crecimiento semanal en la gráfica de **Páginas Indexadas**.

---

## Parte 3: Notificación Masiva Adicional (IndexNow y Google API)

### Ejecutar IndexNow (Bing, Yandex, Seznam)
En la terminal de tu servidor o equipo local, puedes notificar en lote las 350 URLs a Bing mediante IndexNow:
```bash
node scripts/index-urls.js --provider=indexnow --key=TU_CLAVE_INDEXNOW
```

### Ejecutar Google Indexing API (Opcional)
Si deseas notificar cambios a la API de Google de forma programática:
1. Crea una **Cuenta de Servicio** en Google Cloud Console con acceso a la *Web Search Indexing API*.
2. Descarga el archivo de llaves `service-account.json` y colócalo en la raíz del proyecto.
3. Asigna permisos de *Propietario* al correo de la Cuenta de Servicio en Google Search Console.
4. Ejecuta:
   ```bash
   node scripts/index-urls.js --provider=google --keyfile=./service-account.json
   ```
