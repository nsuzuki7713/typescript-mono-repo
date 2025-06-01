export interface PaginationInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ApiResponse<T> {
  data: T;
  rateLimit?: {
    remaining: number;
    resetAt: string;
  };
}

export interface FileOutputOptions {
  outputDir: string;
  filename: string;
}
