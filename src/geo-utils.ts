/**
 * Utility function to check if geo-based consent is required
 * Reads from the 'geo-needs-consent' cookie set by Next.js middleware
 *
 * @returns {boolean} true if consent is needed, false otherwise
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { isRegulatedRegion } from '@ourfires/nextjs-gtm';
 *
 * export function middleware(request: NextRequest) {
 *   const needsConsent = isRegulatedRegion(
 *     request.geo?.country,
 *     request.geo?.region
 *   );
 *
 *   const response = NextResponse.next();
 *   response.cookies.set('geo-needs-consent', needsConsent ? '1' : '0');
 *   return response;
 * }
 *
 * // In component
 * const needsConsent = checkGeoConsent();
 * ```
 */
export function checkGeoConsent(): boolean {
  // SSR safety check
  if (typeof document === "undefined") {
    return true; // Default to requiring consent on server
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("geo-needs-consent="));

  if (!cookie) {
    return true; // Fail-safe: require consent if cookie doesn't exist
  }

  return cookie.split("=")[1] === "1";
}

/**
 * Privacy-regulated countries organized by regulation
 */
export const REGULATED_COUNTRIES = {
  /**
   * GDPR (General Data Protection Regulation)
   * European Economic Area (EEA) + United Kingdom
   */
  GDPR: [
    "AT", // Austria
    "BE", // Belgium
    "BG", // Bulgaria
    "HR", // Croatia
    "CY", // Cyprus
    "CZ", // Czech Republic
    "DK", // Denmark
    "EE", // Estonia
    "FI", // Finland
    "FR", // France
    "DE", // Germany
    "GR", // Greece
    "HU", // Hungary
    "IE", // Ireland
    "IT", // Italy
    "LV", // Latvia
    "LT", // Lithuania
    "LU", // Luxembourg
    "MT", // Malta
    "NL", // Netherlands
    "PL", // Poland
    "PT", // Portugal
    "RO", // Romania
    "SK", // Slovakia
    "SI", // Slovenia
    "ES", // Spain
    "SE", // Sweden
    "GB", // United Kingdom
  ] as const,

  /**
   * LGPD (Lei Geral de Proteção de Dados)
   * Brazil's data protection law
   */
  LGPD: ["BR"] as const,

  /**
   * PIPEDA (Personal Information Protection and Electronic Documents Act)
   * Canada's federal privacy law (applies to all provinces)
   */
  PIPEDA: ["CA"] as const,

  /**
   * POPIA (Protection of Personal Information Act)
   * South Africa's data protection law
   */
  POPIA: ["ZA"] as const,
} as const;

/**
 * Flat list of all privacy-regulated countries
 * Includes: GDPR (EU/EEA/UK), LGPD (Brazil), PIPEDA (Canada), POPIA (South Africa)
 *
 * Note: CCPA/CPRA (California, US) requires region-level checking.
 * Use `isRegulatedRegion()` helper for complete coverage including state-level regulations.
 */
export const ALL_REGULATED_COUNTRIES = [
  ...REGULATED_COUNTRIES.GDPR,
  ...REGULATED_COUNTRIES.LGPD,
  ...REGULATED_COUNTRIES.PIPEDA,
  ...REGULATED_COUNTRIES.POPIA,
] as const;

/**
 * Region-level privacy regulations (state/province specific)
 */
export const REGULATED_REGIONS = {
  /**
   * CCPA/CPRA (California Consumer Privacy Act)
   * California, United States
   */
  CCPA: {
    country: "US",
    regions: ["CA"], // California
  },
  // Future additions:
  // CDPA: { country: 'US', regions: ['VA'] }, // Virginia Consumer Data Protection Act
  // CPA: { country: 'US', regions: ['CO'] }, // Colorado Privacy Act
  // CTDPA: { country: 'US', regions: ['CT'] }, // Connecticut Data Privacy Act
} as const;

/**
 * Check if a country/region combination requires privacy consent
 *
 * Handles both country-level regulations (GDPR, LGPD, PIPEDA, POPIA)
 * and region-level regulations (CCPA/CPRA for California)
 *
 * **Privacy-first default:** Returns `true` when country is undefined (local dev, VPN, errors)
 *
 * @param country - ISO 3166-1 alpha-2 country code (e.g., 'US', 'BR', 'CA')
 * @param region - Region/state code (e.g., 'CA' for California)
 * @returns true if consent is required, false otherwise
 *
 * @example
 * ```typescript
 * // In middleware.ts
 * import { isRegulatedRegion } from '@ourfires/nextjs-gtm/server';
 *
 * export function middleware(request: NextRequest) {
 *   const needsConsent = isRegulatedRegion(
 *     request.geo?.country,
 *     request.geo?.region
 *   );
 *
 *   const response = NextResponse.next();
 *   response.cookies.set('geo-needs-consent', needsConsent ? '1' : '0');
 *   return response;
 * }
 * ```
 */
export function isRegulatedRegion(country?: string, region?: string): boolean {
  // Privacy-first: require consent when geo data is unavailable
  if (!country) return true;

  // Check country-level regulations
  if (ALL_REGULATED_COUNTRIES.includes(country as any)) {
    return true;
  }

  // Check region-level regulations
  for (const regulation of Object.values(REGULATED_REGIONS)) {
    if (
      regulation.country === country &&
      (regulation.regions as readonly string[]).includes(region || "")
    ) {
      return true;
    }
  }

  return false;
}
