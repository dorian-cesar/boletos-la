/**
 * Script de prueba para envío de boletos por correo electrónico con datos de prueba (falsos)
 * Sin realizar compra ni pago real.
 *
 * Uso:
 *   node scripts/test-send-ticket.js tu_correo@ejemplo.com
 */

const QRCode = require("qrcode");

async function runTest() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error("❌ Error: Debes proporcionar un correo electrónico de destino.");
    console.log("\nUso:");
    console.log("  node scripts/test-send-ticket.js correo@ejemplo.com\n");
    process.exit(1);
  }

  console.log(`🚀 Iniciando prueba de envío de boleto a: ${targetEmail}`);

  try {
    // 1. Generar código QR en Base64 para la entrada
    const codigoReserva = `TEST-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrDataUrl = await QRCode.toDataURL(codigoReserva);
    const cleanQrBase64 = qrDataUrl.replace(/^data:image\/[a-z]+;base64,/, "");

    // 2. Armar payload de datos simulados (falsos) para el boleto
    const fechaActual = new Date().toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const payloadLocalAPI = {
      emailDestino: targetEmail,
      reservaCodigo: codigoReserva,
      origen: "Asunción (Terminal)",
      destino: "Ciudad del Este",
      fechaViaje: "25 de Agosto, 2026",
      horaSalida: "08:30 AM",
      horaLlegada: "01:45 PM",
      duracion: "5h 15m",
      asiento: "14A",
      servicio: "Semicama Executive",
      empresa: "La Santaniana",
      pasajeroNombre: "Prueba Usuario Ficticio",
      documento: "4.567.890",
      email: targetEmail,
      fechaNacimiento: "15/05/1995",
      telefono: "+595 981 000 111",
      total: "Gs. 120.000",
      metodoPago: "Prueba de Diagnóstico (Sin Pago)",
      numeroFactura: "001-001-0099887",
      timbrado: "1731316",
      fechaVenta: fechaActual,
      cdc: "0180012667000100100012341202404221100000000",
      qrBase64: cleanQrBase64,
    };

    const externalPayload = {
      templateName: "ticket-boleto",
      emailDestino: targetEmail,
      logo: "logo-santaniana-blanco.png",
      logoBoletos: "logo-boletos.png",
      type: "boletos.la",
      reservaCodigo: payloadLocalAPI.reservaCodigo,
      numeroFactura: payloadLocalAPI.numeroFactura,
      timbrado: payloadLocalAPI.timbrado,
      fechaVenta: payloadLocalAPI.fechaVenta,
      origen: payloadLocalAPI.origen,
      destino: payloadLocalAPI.destino,
      fechaViaje: payloadLocalAPI.fechaViaje,
      horaSalida: payloadLocalAPI.horaSalida,
      horaLlegada: payloadLocalAPI.horaLlegada,
      duracion: payloadLocalAPI.duracion,
      asiento: payloadLocalAPI.asiento,
      servicio: payloadLocalAPI.servicio,
      pasajeroNombre: payloadLocalAPI.pasajeroNombre,
      documento: payloadLocalAPI.documento,
      email: payloadLocalAPI.email,
      fechaNacimiento: payloadLocalAPI.fechaNacimiento,
      total: payloadLocalAPI.total,
      cdc: payloadLocalAPI.cdc,
      qrBase64: cleanQrBase64,
    };

    console.log("📦 Datos simulados generados correctamente:");
    console.log(` - Código de Reserva: ${codigoReserva}`);
    console.log(` - Pasajero: ${payloadLocalAPI.pasajeroNombre}`);
    console.log(` - Ruta: ${payloadLocalAPI.origen} -> ${payloadLocalAPI.destino}`);

    const backendUrl =
      process.env.NEXT_PUBLIC_EXTERNAL_PDF_API_URL ||
      "https://new-backend-pdf.dev-wit.com";
    const endpoint = `${backendUrl}/api/mail/send-ticket`;

    console.log(`\n📨 Enviando petición al servicio externo: ${endpoint}...`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalPayload),
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = await response.text();
    }

    if (response.ok) {
      console.log("\n✅ ¡ÉXITO! El boleto de prueba ha sido enviado por correo.");
      console.log("Respuesta del servidor:", result);
      console.log(`\nRevisa la bandeja de entrada y spam de: ${targetEmail}`);
    } else {
      console.error("\n❌ Error al enviar el correo:");
      console.error(`Status HTTP: ${response.status} ${response.statusText}`);
      console.error("Detalle:", result);
    }
  } catch (error) {
    console.error("\n❌ Error inesperado durante la ejecución:", error.message);
  }
}

runTest();
