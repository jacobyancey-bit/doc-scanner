import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { WebSyncPayload } from '../types/document';

export interface WebSessionTrigger {
  sessionId?: string;
  callbackUrl?: string;
  action?: 'scan' | 'sync' | 'view';
}

export class DeepLinkService {
  /**
   * SSRF Guard: Validates that the callback URL belongs strictly to authorized studio domains.
   */
  static isAllowedCallbackUrl(url: string | undefined): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      return (
        host === 'dangling-dice-studios.com' ||
        host.endsWith('.dangling-dice-studios.com') ||
        (__DEV__ && (host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Parses incoming URL from your website (e.g., docscan://scan?session=123)
   * Enforces SSRF whitelist verification on callback endpoints.
   */
  static parseUrl(url: string): WebSessionTrigger {
    const parsed = Linking.parse(url);
    const queryParams = parsed.queryParams || {};

    const rawCallback = queryParams.callback as string | undefined;
    const validatedCallback = this.isAllowedCallbackUrl(rawCallback) ? rawCallback : undefined;

    if (rawCallback && !validatedCallback) {
      console.warn('Blocked untrusted callback URL in deep link request');
    }

    return {
      action: (parsed.path as WebSessionTrigger['action']) || (queryParams.action as WebSessionTrigger['action']) || 'scan',
      sessionId: queryParams.session as string | undefined,
      callbackUrl: validatedCallback,
    };
  }

  /**
   * Dispatches scanned document to your authorized website session endpoint.
   * Includes 10-second timeout guard, request correlation ID, and safe error handling.
   */
  static async sendToWebSession(
    callbackUrl: string,
    sessionId: string,
    pdfBase64: string,
    title: string
  ): Promise<boolean> {
    if (!this.isAllowedCallbackUrl(callbackUrl)) {
      console.warn('Rejected outbound dispatch: callback domain not whitelisted');
      return false;
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payload: WebSyncPayload = {
      sessionId,
      title,
      pdfBase64,
      timestamp: new Date().toISOString(),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout guard

      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'X-Client-App': 'DocScan-Android',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error: any) {
      // Safe sanitized logging - NEVER log payload or document content
      const isTimeout = error?.name === 'AbortError';
      console.warn(`Web session dispatch failed [${requestId}]: ${isTimeout ? 'Request timed out (10s)' : 'Network error'}`);
      return false;
    }
  }
}

/**
 * React hook to listen for website QR code / deep links
 */
export const useWebDeepLink = (onTrigger: (trigger: WebSessionTrigger) => void) => {
  useEffect(() => {
    // Check initial launch URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        onTrigger(DeepLinkService.parseUrl(url));
      }
    });

    // Listen to foreground URL events
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) {
        onTrigger(DeepLinkService.parseUrl(event.url));
      }
    });

    return () => subscription.remove();
  }, [onTrigger]);
};

