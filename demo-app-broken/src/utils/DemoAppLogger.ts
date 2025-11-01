/**
 * Demo App Logger
 * Singleton logger for capturing and displaying ad events
 */

export interface DemoAppLogEntry {
  message: string;
  timestamp: Date;
  formattedTimestamp: string;
}

type LogUpdateListener = (logs: readonly DemoAppLogEntry[]) => void;

/**
 * Singleton logger for the demo app
 * Captures ad events and user interactions for debugging and demonstration
 */
export class DemoAppLogger {
  private static instance: DemoAppLogger;
  private logs: DemoAppLogEntry[] = [];
  private listeners: Set<LogUpdateListener> = new Set();
  private readonly MAX_LOGS = 500;

  private constructor() {}

  /**
   * Get the shared singleton instance
   */
  static get sharedInstance(): DemoAppLogger {
    if (!DemoAppLogger.instance) {
      DemoAppLogger.instance = new DemoAppLogger();
    }
    return DemoAppLogger.instance;
  }

  /**
   * Format timestamp as HH:mm:ss.SSS
   */
  private formatTimestamp(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * Format ad details from event data
   */
  private formatAdDetails(ad?: any): string {
    if (!ad) return '';
    
    const details: string[] = [];
    
    if (ad.adId) details.push(`adId: ${ad.adId}`);
    if (ad.placement) details.push(`placement: ${ad.placement}`);
    if (ad.network) details.push(`network: ${ad.network}`);
    if (ad.revenue !== undefined) details.push(`revenue: $${ad.revenue}`);
    if (ad.creativeId) details.push(`creativeId: ${ad.creativeId}`);
    
    return details.length > 0 ? ` (${details.join(', ')})` : '';
  }

  /**
   * Log a simple message
   */
  logMessage(message: string): void {
    if (!message) return;

    const timestamp = new Date();
    const entry: DemoAppLogEntry = {
      message,
      timestamp,
      formattedTimestamp: this.formatTimestamp(timestamp),
    };

    this.logs.push(entry);

    // Keep only the last 500 logs to prevent memory issues
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Also log to console for debugging
    console.log('📱 [DemoApp]', message);

    // Notify all listeners
    this.notifyListeners();
  }

  /**
   * Log an ad event with ad details
   */
  logAdEvent(eventName: string, ad?: any): void {
    const adDetails = this.formatAdDetails(ad);
    const fullMessage = `${eventName}${adDetails}`;
    this.logMessage(fullMessage);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Get all logs as an immutable list
   */
  getAllLogs(): readonly DemoAppLogEntry[] {
    return Object.freeze([...this.logs]);
  }

  /**
   * Get log count
   */
  get logCount(): number {
    return this.logs.length;
  }

  /**
   * Subscribe to log updates
   * Returns an unsubscribe function
   */
  subscribe(listener: LogUpdateListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current logs
    listener(this.getAllLogs());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of log updates
   */
  private notifyListeners(): void {
    const immutableLogs = this.getAllLogs();
    this.listeners.forEach(listener => {
      try {
        listener(immutableLogs);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }
}

// Export singleton instance
export const logger = DemoAppLogger.sharedInstance;

