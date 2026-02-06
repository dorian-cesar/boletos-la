// lib/pagopar-utils.ts
import crypto from "crypto";

export class PagoparUtils {
  private static privateKey: string = process.env.PAGOPAR_PRIVATE_KEY || "";
  private static publicKey: string = process.env.PAGOPAR_PUBLIC_KEY || "";

  // Generar token para crear pedido
  static generateTransactionToken(
    idPedido: string,
    montoTotal: number,
  ): string {
    const montoStr = String(parseFloat(montoTotal.toString()));
    const texto = this.privateKey + idPedido + montoStr;
    return crypto.createHash("sha1").update(texto).digest("hex");
  }

  // Generar token para validar webhook
  static generateCallbackToken(hashPedido: string): string {
    const texto = this.privateKey + hashPedido;
    return crypto.createHash("sha1").update(texto).digest("hex");
  }

  // Generar token para consultar estado
  static generateCheckToken(): string {
    const texto = this.privateKey + "CONSULTA";
    return crypto.createHash("sha1").update(texto).digest("hex");
  }

  // Generar token para listar métodos de pago
  static generatePaymentMethodsToken(): string {
    const texto = this.privateKey + "FORMA-PAGO";
    return crypto.createHash("sha1").update(texto).digest("hex");
  }

  // Validar token recibido en webhook
  static validateCallbackToken(
    receivedToken: string,
    hashPedido: string,
  ): boolean {
    const expectedToken = this.generateCallbackToken(hashPedido);
    return receivedToken === expectedToken;
  }

  // Obtener URL de pago Pagopar
  static getPaymentUrl(hash: string, paymentMethodId?: string): string {
    let url = `https://www.pagopar.com/pagos/${hash}`;
    if (paymentMethodId) {
      url += `?forma_pago=${paymentMethodId}`;
    }
    return url;
  }
}
