# Diagrama de Flujo - Venta de Boletos y Configuración de Pagos

Este documento contiene la arquitectura de flujo de la **Venta de Boletos**, los canales de cobro (**Página Web** y **Tótem**), métodos de pago (**VPOS Virtual**, **POS Físico**, **QR** y **Tarjeta**) y las reglas de **Preautorización** (**Nacional**, **Internacional - Visa / Mastercard**).

---

## 1. Diagrama de Texto Plano (Fuente reducida y contenedor ajustable)

<div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; overflow-x: auto; margin-bottom: 24px;">
<pre style="font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.15; color: #38bdf8; margin: 0; white-space: pre;">
===================================================================================================================================================================
                                                                        VENTA DE BOLETOS
===================================================================================================================================================================
                                                                               │
                       ┌───────────────────────────────────────────────────────┴───────────────────────────────────────────────────────┐
                       │                                                                                                               │
            ┌──────────▼──────────┐                                                                                         ┌──────────▼──────────┐
            │     PÁGINA WEB      │                                                                                         │        TÓTEM        │
            └──────────┬──────────┘                                                                                         └──────────┬──────────┘
                       │                                                                                                               │
               ┌───────▼───────┐                                                                                               ┌───────┴───────┐
               │ VPOS Virtual  │                                                                                               │               │
               └───────┬───────┘                                                                                       ┌───────▼───────┐ ┌─────▼─────┐
                       │                                                                                               │ VPOS Virtual  │ │POS Físico │
                       │                                                                                               └───────┬───────┘ └─────┬─────┘
                       │                                                                                                       │               │
                       │                                                                                                       │         ┌─────▼─────┐
                       │                                                                                                       │         │ Tarjeta   │
                       │                                                                                                       │         │ Contacto  │
                       │                                                                                                       │         └───────────┘
          ┌────────────┴────────────┐                                                                             ┌────────────┴────────────┐
          │                         │                                                                             │                         │
     ┌────▼────┐              ┌─────▼─────┐                                                                  ┌────▼────┐              ┌─────▼─────┐
     │ Pago QR │              │  Tarjeta  │                                                                  │ Pago QR │              │  Tarjeta  │
     └─────────┘              └─────┬─────┘                                                                  └─────────┘              └─────┬─────┘
                                    │                                                                                                       │
                       ┌────────────┴────────────┐                                                                             ┌────────────┴────────────┐
                       │                         │                                                                             │                         │
                  ┌────▼────┐              ┌─────▼─────┐                                                                  ┌────▼────┐              ┌─────▼─────┐
                  │Nacional │              │Internac.  │                                                                  │Nacional │              │Internac.  │
                  └────┬────┘              └─────┬─────┘                                                                  └────┬────┘              └─────┬─────┘
                       │                         │                                                                             │                         │
               ┌───────▼───────┐          ┌──────┴──────┐                                                             ┌───────▼───────┐          ┌──────┴──────┐
               │ Preautoriza   │          │             │                                                             │ Preautoriza   │          │             │
               │  Habilitada   │     ┌────▼────┐   ┌────▼────┐                                                        │  Habilitada   │     ┌────▼────┐   ┌────▼────┐
               └───────────────┘     │  Visa   │   │Mastercd │                                                        └───────────────┘     │  Visa   │   │Mastercd │
                                     └────┬────┘   └────┬────┘                                                                              └────┬────┘   └────┬────┘
                                          │             │                                                                                        │             │
                                     ┌────▼────┐   ┌────▼────┐                                                                              ┌────▼────┐   ┌────▼────┐
                                     │NO usa   │   │Preaut.  │                                                                              │NO usa   │   │Preaut.  │
                                     │Preaut.  │   │Habilit. │                                                                              │Preaut.  │   │Habilit. │
                                     └─────────┘   └─────────┘                                                                              └─────────┘   └─────────┘
</pre>
</div>

---

## 2. Desglose en Texto Plano por Canales

### 🌐 Canal 1: Página Web

```text
[ VENTA DE BOLETOS ]
   └── [ Página Web ]
        └── [ VPOS Virtual ]
             ├── [ 1. Pago QR ]
             └── [ 2. Pago Tarjeta ]
                  ├── [ A. Nacional ] ───────────────────► [ Preautorización Habilitada ]
                  └── [ B. Internacional ]
                       ├── [ B.1 Visa ] ───────────────► [ NO usa Preautorización ]
                       └── [ B.2 Mastercard ] ─────────► [ Preautorización Habilitada ]
```

---

### 🖥️ Canal 2: Tótem

```text
[ VENTA DE BOLETOS ]
   └── [ Tótem ]
        ├── [ POS Físico ] ─────────────────────────────► [ Tarjeta de Contacto ]
        └── [ VPOS Virtual ]
             ├── [ 1. Pago QR ]
             └── [ 2. Pago Tarjeta ]
                  ├── [ A. Nacional ] ───────────────────► [ Preautorización Habilitada ]
                  └── [ B. Internacional ]
                       ├── [ B.1 Visa ] ───────────────► [ NO usa Preautorización ]
                       └── [ B.2 Mastercard ] ─────────► [ Preautorización Habilitada ]
```

---

## 3. Diagrama Visual (Mermaid)

```mermaid
graph TD
    ROOT["VENTA DE BOLETOS"] --> WEB["Página Web"]
    ROOT --> TOTEM["Tótem"]

    %% Canal Página Web
    WEB --> WEB_VPOS["VPOS Virtual"]
    WEB_VPOS --> WEB_QR["Pago QR"]
    WEB_VPOS --> WEB_CARD["Pago Tarjeta"]

    WEB_CARD --> WEB_NAC["Nacional"]
    WEB_CARD --> WEB_INT["Internacional"]

    WEB_NAC --> WEB_PREAUTH_OK["Preautorización Habilitada"]
    WEB_INT --> WEB_VISA["Visa"]
    WEB_INT --> WEB_MC["Mastercard"]

    WEB_VISA --> WEB_NO_PREAUTH["NO usa Preautorización"]
    WEB_MC --> WEB_PREAUTH_OK2["Preautorización Habilitada"]

    %% Canal Tótem
    TOTEM --> TOTEM_VPOS["VPOS Virtual"]
    TOTEM --> TOTEM_POS["POS Físico"]

    TOTEM_POS --> TOTEM_CONTACT["Tarjeta de Contacto"]

    TOTEM_VPOS --> TOTEM_QR["Pago QR"]
    TOTEM_VPOS --> TOTEM_CARD["Pago Tarjeta"]

    TOTEM_CARD --> TOTEM_NAC["Nacional"]
    TOTEM_CARD --> TOTEM_INT["Internacional"]

    TOTEM_NAC --> TOTEM_PREAUTH_OK["Preautorización Habilitada"]
    TOTEM_INT --> TOTEM_VISA["Visa"]
    TOTEM_INT --> TOTEM_MC["Mastercard"]

    TOTEM_VISA --> TOTEM_NO_PREAUTH["NO usa Preautorización"]
    TOTEM_MC --> TOTEM_PREAUTH_OK2["Preautorización Habilitada"]

    classDef header fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef web fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef totem fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#fff;
    classDef preauthOk fill:#065f46,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef preauthNo fill:#991b1b,stroke:#ef4444,stroke-width:2px,color:#fff;

    class ROOT header;
    class WEB,WEB_VPOS,WEB_CARD web;
    class TOTEM,TOTEM_VPOS,TOTEM_POS totem;
    class WEB_PREAUTH_OK,WEB_PREAUTH_OK2,TOTEM_PREAUTH_OK,TOTEM_PREAUTH_OK2 preauthOk;
    class WEB_NO_PREAUTH,TOTEM_NO_PREAUTH preauthNo;
```

---

## 4. Resumen de Reglas de Negocio

| Canal | Tipo de Tarjeta / Marca | ¿Usa Preautorización? | `preauthorization` Payload | Acciones en Confirmación |
|---|---|---|---|---|
| Web / Tótem | Tarjetas Nacionales | **Sí** | `true` | Se realiza `/confirmar-transaccion` tras emitir boletos |
| Web / Tótem | Internacional - Mastercard | **Sí** | `true` | Se realiza `/confirmar-transaccion` tras emitir boletos |
| Web / Tótem | Internacional - VISA | **No** (Venta Directa) | `false` | Se omite `/confirmar-transaccion` (cobro automático) |
