// lib/dates.ts
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

export const TIMEZONE_PARAGUAY = "America/Asuncion";

/**
 * Retorna un objeto Date ajustado a la hora local de Paraguay (America/Asuncion)
 */
export const getParaguayDate = (date: Date = new Date()): Date => {
  const paraguayTimeString = date.toLocaleString("en-US", {
    timeZone: TIMEZONE_PARAGUAY,
  });
  return new Date(paraguayTimeString);
};

export const parseTravelDate = (date: string) =>
  parse(date, "yyyy-MM-dd", new Date());

export const formatTravelDate = (date: string) =>
  format(parseTravelDate(date), "EEEE d 'de' MMMM, yyyy", { locale: es });

/**
 * Formatea una fecha en formato string usando la zona horaria de Paraguay
 */
export const formatInParaguayTZ = (
  date: Date = new Date(),
  pattern: string = "dd/MM/yyyy HH:mm"
): string => {
  const pyDate = getParaguayDate(date);
  return format(pyDate, pattern, { locale: es });
};
