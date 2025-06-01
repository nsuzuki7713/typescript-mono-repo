/**
 * Date utility functions
 */
export class DateUtils {
  /**
   * Check if a date string is within the specified date range
   */
  static isDateInRange(
    dateString: string,
    startDate: string,
    endDate: string
  ): boolean {
    const date = new Date(dateString);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return date >= start && date <= end;
  }

  /**
   * Format date to ISO string
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date string to Date object
   */
  static parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  /**
   * Calculate difference between two dates in hours
   */
  static getDifferenceInHours(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  }
}

/**
 * Array utility functions
 */
export class ArrayUtils {
  /**
   * Remove duplicates from array based on a key function
   */
  static uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>();
    return array.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Chunk array into smaller arrays of specified size
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private minInterval: number;

  constructor(requestsPerSecond: number) {
    this.minInterval = 1000 / requestsPerSecond;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeToWait = this.minInterval - (now - this.lastRequestTime);

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    this.lastRequestTime = Date.now();
  }
}
