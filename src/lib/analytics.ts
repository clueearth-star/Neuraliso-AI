/**
 * Neuraliso AI - Google Analytics Integration & Interactive Event Sandbox
 * Dynamic GA4 loader with a real-time event visualizer log, enabling direct
 * verification of event telemetry within the container sandbox environment.
 */

export interface GAEvent {
  id: string;
  name: string;
  params: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private measurementId: string = "";
  private eventLog: GAEvent[] = [];
  private onLogUpdated: (() => void) | null = null;

  constructor() {
    // Check if measurement ID is declared in environment, else fallback to demo
    this.measurementId = ((import.meta as any).env?.VITE_GA_MEASUREMENT_ID as string) || "G-NEURALISO99";
    this.initGA();
  }

  /**
   * Registers a listener to refresh UI logs in the analytics sandbox debug tab.
   */
  public registerUpdateListener(callback: () => void) {
    this.onLogUpdated = callback;
  }

  public getEventLogs(): GAEvent[] {
    return this.eventLog;
  }

  public clearLogs() {
    this.eventLog = [];
    if (this.onLogUpdated) this.onLogUpdated();
  }

  /**
   * Initializes GA4 scripts dynamically in index.html head.
   */
  private initGA() {
    if (typeof window === "undefined" || (window as any)._gaInitialized) return;

    try {
      const win = window as any;
      // Create global data layer
      win.dataLayer = win.dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag("js", new Date());
      gtag("config", this.measurementId, {
        send_page_view: false, // controlled manually for SPAs
        cookie_flags: "max-age=7200;Secure;SameSite=None" // secure iframe support
      });

      // Inject the script tag
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      (window as any)._gaInitialized = true;
      
      this.logTelemetryEvent("system_initialized", {
        measurement_id: this.measurementId,
        platform: "React Vite Fullstack"
      });
      console.log(`[Google Analytics] Dynamic initialization complete with ID: ${this.measurementId}`);
    } catch (e) {
      console.warn("Failed to initialize Google Analytics tag script. Operating in sandbox logging mode.", e);
    }
  }

  /**
   * Log GA event to real tracking services + real-time diagnostic dashboard
   */
  public logTelemetryEvent(eventName: string, params: Record<string, any> = {}) {
    const formattedParams = {
      ...params,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "NodeServer",
      local_time: new Date().toISOString()
    };

    // 1. Submit to real Google tag if loaded
    if (typeof window !== "undefined" && (window as any).gtag) {
      try {
        (window as any).gtag("event", eventName, formattedParams);
      } catch (err) {
        // Safe catch for iframe restrictions
      }
    }

    // 2. Log in our developer telemetry console
    const newEvent: GAEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: eventName,
      params: formattedParams,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    this.eventLog = [newEvent, ...this.eventLog].slice(0, 50);
    
    if (this.onLogUpdated) {
      try {
        this.onLogUpdated();
      } catch (e) {
        // noop
      }
    }
  }

  /**
   * Utility tracker for Page / View transitions.
   */
  public trackPageView(viewName: string) {
    this.logTelemetryEvent("page_view", {
      page_title: `Neuraliso Portal - ${viewName.toUpperCase()}`,
      page_location: window.location.href,
      page_path: `/${viewName}`
    });
  }
}

export const analytics = new AnalyticsService();
export default analytics;
