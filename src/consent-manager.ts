import type { ConsentState, ConsentEventHandler } from "./types";

/**
 * ConsentManager - Manages GDPR consent state via first-party cookies
 * and implements Google Consent Mode v2 integration.
 *
 * Usage:
 * ```ts
 * const consentManager = new ConsentManager({ cookieName: 'my_consent' });
 * consentManager.acceptAll();
 * ```
 */
export class ConsentManager {
  private cookieName: string;
  private cookieExpiry: number;
  private subscribers: Set<ConsentEventHandler>;

  constructor(config?: { cookieName?: string; cookieExpiry?: number }) {
    this.cookieName = config?.cookieName || "user_consent";
    this.cookieExpiry = config?.cookieExpiry || 365;
    this.subscribers = new Set();
  }

  /**
   * Get current consent state from cookie
   * @returns ConsentState or null if no consent exists
   */
  getConsent(): ConsentState | null {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split("; ");
    const consentCookie = cookies.find((c) => c.startsWith(`${this.cookieName}=`));

    if (!consentCookie) return null;

    try {
      const value = consentCookie.split("=")[1];
      const decoded = decodeURIComponent(value);
      return JSON.parse(decoded) as ConsentState;
    } catch (error) {
      console.error("Failed to parse consent cookie:", error);
      return null;
    }
  }

  /**
   * Set consent state and save to cookie
   * @param consent - ConsentState object
   */
  setConsent(consent: ConsentState): void {
    if (typeof window === "undefined") return;

    // Ensure necessary is always true
    const finalConsent: ConsentState = {
      ...consent,
      necessary: true,
      timestamp: Date.now(),
    };

    // Encode and save to cookie
    const encoded = encodeURIComponent(JSON.stringify(finalConsent));
    const expires = new Date();
    expires.setDate(expires.getDate() + this.cookieExpiry);

    document.cookie = `${this.cookieName}=${encoded}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Update Google Consent Mode
    this.updateGoogleConsentMode(finalConsent);

    // Notify subscribers
    this.subscribers.forEach((callback) => callback(finalConsent));
  }

  /**
   * Check if any consent has been given
   * @returns true if consent cookie exists
   */
  hasConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Check if analytics consent is granted
   * @returns true if analytics is enabled
   */
  hasAnalyticsConsent(): boolean {
    const consent = this.getConsent();
    return consent?.analytics === true;
  }

  /**
   * Check if marketing consent is granted
   * @returns true if marketing is enabled
   */
  hasMarketingConsent(): boolean {
    const consent = this.getConsent();
    return consent?.marketing === true;
  }

  /**
   * Check if preferences consent is granted
   * @returns true if preferences is enabled
   */
  hasPreferencesConsent(): boolean {
    const consent = this.getConsent();
    return consent?.preferences === true;
  }

  /**
   * Accept all cookie categories
   */
  acceptAll(): void {
    this.setConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now(),
    });
  }

  /**
   * Reject all cookie categories except necessary
   */
  rejectAll(): void {
    this.setConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to consent changes
   * @param callback - Function to call when consent changes
   * @returns Unsubscribe function
   */
  subscribe(callback: ConsentEventHandler): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update Google Consent Mode v2 via dataLayer
   * @param consent - Current consent state
   */
  updateGoogleConsentMode(consent: ConsentState): void {
    if (typeof window === "undefined") return;

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Map consent state to Google Consent Mode parameters
    const consentParams = {
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
      functionality_storage: consent.preferences ? "granted" : "denied",
      personalization_storage: consent.preferences ? "granted" : "denied",
      security_storage: "granted" as const,
    };

    // Push consent update to dataLayer
    window.dataLayer.push({
      event: "consent_update",
      consent: consentParams,
    });
  }

  /**
   * Initialize Google Consent Mode with default "denied" state
   * Call this before GTM loads
   */
  initializeGoogleConsentMode(): void {
    if (typeof window === "undefined") return;

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Push default denied consent
    window.dataLayer.push({
      event: "consent_default",
      consent: {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        functionality_storage: "denied",
        personalization_storage: "denied",
        security_storage: "granted",
      },
    });
  }
}
