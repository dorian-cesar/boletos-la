// lib/dates.ts
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

export const parseTravelDate = (date: string) =>
  parse(date, "yyyy-MM-dd", new Date());

export const formatTravelDate = (date: string) =>
  format(parseTravelDate(date), "EEEE d 'de' MMMM, yyyy", { locale: es });
