/**
 * Retry Helper Utilities
 * 
 * Provides automatic retry logic for failed operations
 * with exponential backoff.
 */

export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxAttempts?: number;
  
  /**
   * Initial delay in milliseconds
   */
  initialDelay?: number;
  
  /**
   * Maximum delay in milliseconds
   */
  maxDelay?: number;
  
  /**
   * Backoff multiplier
   */
  backoffMultiplier?: number;
  
  /**
   * Function to determine if error is retryable
   */
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  shouldRetry: (error) => {
    // Retry on network errors, timeouts, and 5xx errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return true; // Network error
    }
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return true; // Timeout
    }
    if (error?.status >= 500 && error?.status < 600) {
      return true; // Server error
    }
    return false;
  },
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param operation - Async function to retry
 * @param config - Retry configuration
 * @returns Result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === finalConfig.maxAttempts || !finalConfig.shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      );
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Retry a fetch request with timeout
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Request timeout in milliseconds
 * @param retryConfig - Retry configuration
 * @returns Fetch response
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 10000,
  retryConfig?: RetryConfig
): Promise<Response> {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      // Throw on HTTP error status
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }, retryConfig);
}
