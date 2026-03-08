export const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
};
