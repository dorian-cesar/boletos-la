import CryptoJS from "crypto-js";

// EXACTAMENTE lo que espera tu código
export interface PagoparPaymentData {
  montoTotal: number;
  datosComprador: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rut?: string;
    // NO agregar direccion ni ciudad - tu código las deja vacías
  };
}

export function encryptData(data: PagoparPaymentData): string {
  const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

  if (!secret) {
    throw new Error("NEXT_PUBLIC_SECRET_ENCRYPT_DATA no configurada");
  }

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secret,
  ).toString();
  return encrypted;
}
