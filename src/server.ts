/**
 * @ourfires/nextjs-gtm/server
 *
 * Server-side utilities for Next.js middleware/proxy
 * Safe to import in server contexts without "use client" errors
 */

export {
  isRegulatedRegion,
  checkGeoConsent,
  REGULATED_COUNTRIES,
  REGULATED_REGIONS,
  ALL_REGULATED_COUNTRIES,
} from "./geo-utils";

export type { ConsentState } from "./types";
