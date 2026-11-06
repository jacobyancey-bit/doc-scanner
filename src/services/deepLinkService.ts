import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export interface WebSessionTrigger {
  sessionId?: string;
  callbackUrl?: string;
  action?: 'scan' | 'sync' | 'view';
}

export class DeepLinkService {
  /**
   * Parses incoming URL from your website (e.g., docscan://scan?session=123)
   */
  static parseUrl(url: string): WebSessionTrigger {
    const parsed = Linking.parse(url);
    const queryParams = parsed.queryParams || {};

    return {
      action: (parsed.path as WebSessionTrigger['action']) || (queryParams.action as WebSessionTrigger['action']) || 'scan',
      sessionId: queryParams.session as string | undefined,
      callbackUrl: queryParams.callback as string | undefined,
    };
  }

  /**
   * Dispatches scanned document to your website session endpoint
   */
  static async sendToWebSession(
    callbackUrl: string,
    sessionId: string,
    pdfBase64: string,
    title: string
  ): Promise<boolean> {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          title,
          pdfBase64,
          timestamp: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to sync document to web session:', error);
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

