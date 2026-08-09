/**
 * Lightweight Analytics Tracking Utility.
 * Logs user interaction events (claims, searches, bookmarks, upvotes, submissions).
 */

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Development debug logging
  console.debug(`[Analytics] 📊 ${eventName}`, properties || '');

  // Dispatch custom window event for extension/integrations
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('freebieverse_analytics', { detail: event }));
  }
};
