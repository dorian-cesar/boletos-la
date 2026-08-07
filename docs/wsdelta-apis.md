# Documentación de APIs Relacionadas con WS Delta

Este documento contiene el listado completo de los endpoints y rutas de API en el proyecto **boletos-la** que consumen e interactúan con el servicio **WS Delta** a través del backend.

---

## 1. Variables de Entorno y Autenticación

Todas las rutas proxy en el frontend (`app/api/gds/*`) interactúan con el backend mediante las siguientes variables de entorno:

- `NEXT_PUBLIC_BACKEND_URL`: URL base del backend central.
- `NEXT_PUBLIC_AUTH_EMAIL`: Email para la autenticación de servicio.
- `NEXT_PUBLIC_AUTH_PASSWORD`: Contraseña para la autenticación de servicio.
- `NEXT_PUBLIC_APP_CHANNEL`: Canal de la aplicación (por defecto: `web`).

La autenticación obtiene un token JWT desde `${backendUrl}/api/auth/email`, el cual se almacena en la cookie `auth_token` e incluye la cabecera `Authorization: Bearer <token>` en cada petición enviada a los endpoints de WS Delta (`/api/gds/delta/*`).

---

## 2. Resumen de Endpoints

| Funcionalidad | Método HTTP | Ruta API (Next.js) | Endpoint Backend (WS Delta) |
| :--- | :---: | :--- | :--- |
| **Listado de Paradas / Estaciones** | `GET` | [/app/api/gds/stops/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/stops/route.ts) | `${backendUrl}/api/gds/delta/stops` |
| **Búsqueda de Servicios / Itinerarios** | `GET` | [/app/api/gds/search/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/search/route.ts) | `${backendUrl}/api/gds/delta/search` |
| **Disponibilidad de Asientos (Croquis)** | `GET` | [/app/api/gds/seats/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/seats/route.ts) | `${backendUrl}/api/gds/delta/availability` |
| **Bloqueo Temporal de Asientos** | `POST` | [/app/api/gds/block/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/block/route.ts) | `${backendUrl}/api/gds/delta/block` |
| **Desbloqueo de Asientos** | `POST` | [/app/api/gds/unblock/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/unblock/route.ts) | `${backendUrl}/api/gds/delta/unblock` |
| **Venta / Confirmación de Pasajes** | `POST` | [/app/api/gds/sell/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/sell/route.ts) | `${backendUrl}/api/gds/delta/sell` |
| **Búsqueda de Pasajero** | `POST` | [/app/api/gds/passenger/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/passenger/route.ts) | `${backendUrl}/api/gds/delta/findPassenger` |
| **Creación / Registro de Pasajero** | `POST` | [/app/api/gds/passenger/create/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/passenger/create/route.ts) | `${backendUrl}/api/gds/delta/createPassenger` |
| **Tipos de Documento** | `GET` | [/app/api/gds/doc-types/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/doc-types/route.ts) | `${backendUrl}/api/gds/delta/doc-types` |
| **Lista de Países** | `GET` | [/app/api/gds/countries/route.ts](file:///c:/NodeJs/boletos-la/app/api/gds/countries/route.ts) | `${backendUrl}/api/gds/delta/countries` |

---

## 3. Detalle Técnico de los Endpoints

### 3.1. Listar Paradas (`/api/gds/stops`)
- **Método**: `GET`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/stops`
- **Descripción**: Obtiene la lista completa de paradas, terminales y localidades de origen/destino disponibles en el sistema WS Delta.

### 3.2. Buscar Servicios (`/api/gds/search`)
- **Método**: `GET`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/search`
- **Query Params Requeridos**:
  - `originId`: ID del origen.
  - `destinationId`: ID del destino.
  - `date`: Fecha del viaje (formato `YYYY-MM-DD`).
- **Descripción**: Consulta las salidas, itinerarios y precios de viajes en la fecha indicada.

### 3.3. Disponibilidad de Asientos (`/api/gds/seats`)
- **Método**: `GET`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/availability`
- **Query Params Requeridos**:
  - `serviceId`: ID del servicio seleccionado.
  - `originId`: ID de la parada de origen.
  - `destinationId`: ID de la parada de destino.
- **Descripción**: Retorna el mapa y estado de ocupación de los asientos del autobús para el servicio especificado.

### 3.4. Bloquear Asientos (`/api/gds/block`)
- **Método**: `POST`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/block`
- **Body JSON**:
  ```json
  {
    "serviceId": "string",
    "originId": "string",
    "destinationId": "string",
    "seats": "array | string",
    "connectionId": "string (opcional)"
  }
  ```
- **Descripción**: Bloquea temporalmente los asientos seleccionados para impedir que otros usuarios los adquieran mientras se completa la compra.

### 3.5. Desbloquear Asientos (`/api/gds/unblock`)
- **Método**: `POST`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/unblock`
- **Body JSON**:
  ```json
  {
    "connectionId": "string"
  }
  ```
- **Descripción**: Cancela o libera un bloqueo temporal previo de asientos usando el ID de conexión.

### 3.6. Venta y Confirmación de Pasajes (`/api/gds/sell`)
- **Método**: `POST`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/sell`
- **Body JSON**:
  ```json
  {
    "serviceId": "string",
    "originId": "string",
    "destinationId": "string",
    "ticketCount": 1,
    "totalAmount": 1000,
    "seats": ["array de objetos de asientos"],
    "company": "string (opcional)",
    "connectionId": "string (opcional)"
  }
  ```
- **Descripción**: Emite y confirma la venta final del boleto en el GDS WS Delta.

### 3.7. Búsqueda de Pasajero (`/api/gds/passenger`)
- **Método**: `POST`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/findPassenger`
- **Body JSON**:
  ```json
  {
    "docType": "string",
    "docNumber": "string"
  }
  ```
- **Descripción**: Retorna los datos registrados del pasajero en WS Delta a partir de su tipo y número de documento.

### 3.8. Creación de Pasajero (`/api/gds/passenger/create`)
- **Método**: `POST`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/createPassenger`
- **Body JSON**:
  ```json
  {
    "docType": "string",
    "docNumber": "string",
    "name": "string",
    "lastName": "string",
    "phone": "string",
    "occupation": "string",
    "birthDate": "YYYY/MM/DD",
    "gender": "M | F",
    "nationality": "string",
    "country": "string"
  }
  ```
- **Descripción**: Da de alta o actualiza un pasajero en el sistema WS Delta.

### 3.9. Tipos de Documento (`/api/gds/doc-types`)
- **Método**: `GET`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/doc-types`
- **Descripción**: Obtiene los tipos de documento reconocidos por WS Delta (CI, DNI, RUC, Pasaporte, etc.).

### 3.10. Paises (`/api/gds/countries`)
- **Método**: `GET`
- **Ruta Backend**: `${backendUrl}/api/gds/delta/countries`
- **Descripción**: Obtiene la lista de países disponibles en el catálogo de WS Delta.
