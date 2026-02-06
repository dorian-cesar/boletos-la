interface PagoparPaymentData {
  token: string;
  monto_total: number;
  comprador: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    ciudad: string;
    direccion: string;
    documento: string;
    tipo_documento: string;
    ruc?: string;
    razon_social?: string;
  };
  public_key: string;
  pagos: Array<{
    concepto: string;
    monto: number;
    cantidad: number;
  }>;
}
