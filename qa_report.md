# 🧪 Reporte de Control de Calidad (QA) & Pruebas Automatizadas

**Dominio de Pruebas:** [https://control-documental.dg-productos.com](https://control-documental.dg-productos.com)  
**Backend API:** [https://documentos.dg-productos.com/api](https://documentos.dg-productos.com/api)  
**Fecha de Ejecución:** 28 de Agosto de 2026  
**Resultado Global:** **APROBADO (PASSED)** ✅

---

> [!NOTE]
> Se realizó una auditoría completa de extremo a extremo utilizando pruebas headless automatizadas con Puppeteer, validando la comunicación HTTPS, resolución de dominios, intercambio de tokens JWT, peticiones REST API y renderizado del cliente.

---

## 📊 Resumen Ejecutivo de la Evaluación

| Prueba / Criterio | Estado | Detalle |
| :--- | :---: | :--- |
| **Carga & Certificado SSL (HTTPS)** | PASSED ✅ | Dominio resuelve vía HTTPS con certificado SSL válido vía Cloudflare Edge & Netlify CDN. |
| **Autenticación (JWT Login)** | PASSED ✅ | Redirección automática, autenticación con credenciales Admin y persistencia en LocalStorage. |
| **Conexión API (CORS & Endpoints)** | PASSED ✅ | Integración limpia de `control-documental.dg-productos.com` con `documentos.dg-productos.com/api` (0 errores de CORS). |
| **Integridad de Consola JS** | PASSED ✅ | 0 errores fatales en JavaScript. Ejecución fluida en React / Next.js. |
| **Base de Datos RDS MySQL** | PASSED ✅ | Carga en tiempo real de registros semilla (Clientes, Categorías, Documentos y Auditoría). |

---

## 📸 Evidencias Visuales por Módulo (Capturas de Pantalla)

````carousel
![Pantalla de Login](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_01_login.png)
<!-- slide -->
![Dashboard Principal](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_02_dashboard.png)
<!-- slide -->
![Módulo de Documentos](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_03_documents.png)
<!-- slide -->
![Módulo de Clientes](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_04_clients.png)
<!-- slide -->
![Módulo de Categorías](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_05_categories.png)
<!-- slide -->
![Módulo de Auditoría](file:///C:/Users/Dorian/.gemini/antigravity-ide/brain/5d42c2ab-6a74-4ee7-8a18-bb8164f73382/qa_06_audit.png)
````

---

## 🔍 Hallazgos Clave & Correcciones Aplicadas

> [!TIP]
> **Corrección de URL de API en Producción:**
> Durante la primera iteración de QA se identificó que el cliente Axios intentaba conectar a `http://localhost:4000/api`. Se ajustaron los fallbacks en `frontend/src/services/api.ts` y `frontend/src/services/document.service.ts`, y se inyectó `NEXT_PUBLIC_API_URL` en `netlify.toml`. En la re-evaluación, **el 100% de las peticiones fueron dirigidas exitosamente a la API en producción con HTTPS**.

---

## 🔐 Credenciales de Acceso Verificadas

Para ingresar a la plataforma en vivo:

* **URL de Ingreso:** [https://control-documental.dg-productos.com/login](https://control-documental.dg-productos.com/login)
* **Administrador:** `admin@dms.com` / `Admin123!`
* **Usuario Estándar:** `user@dms.com` / `User123!`
