/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, ...args: any[]): void {
    console.log(`[${this.formatTimestamp()}] INFO: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[${this.formatTimestamp()}] WARN: ${message}`, ...args);
  }

  static error(message: string, error?: any): void {
    console.error(`[${this.formatTimestamp()}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG) {
      console.debug(`[${this.formatTimestamp()}] DEBUG: ${message}`, ...args);
    }
  }
}

/**
 * Progress tracker for long-running operations
 */
export class ProgressTracker {
  private total: number;
  private current: number = 0;
  private startTime: number;

  constructor(total: number) {
    this.total = total;
    this.startTime = Date.now();
  }

  increment(): void {
    this.current++;
    this.logProgress();
  }

  private logProgress(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    const eta = remaining / rate;

    Logger.info(
      `Progress: ${this.current}/${
        this.total
      } (${percentage}%) - ETA: ${Math.round(eta)}s`
    );
  }

  complete(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    Logger.info(`Completed ${this.total} items in ${elapsed.toFixed(2)}s`);
  }
}
