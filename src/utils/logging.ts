import process from 'node:process';

/**
 * Production-ready logging utility respecting Node.js CLI conventions
 * Handles --json flags, NODE_ENV, and consistent output patterns
 */

export interface LoggingOptions {
  json?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

export class LoggingUtility {
  private options: LoggingOptions;
  private isProduction: boolean;

  constructor(options: LoggingOptions = {}) {
    this.options = options;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log informational messages - conditional based on flags and environment
   */
  public info(message: string): void {
    if (this.shouldSuppressOutput()) {
      return;
    }
    process.stdout.write(message + '\n');
  }

  /**
   * Log verbose information - only in verbose mode
   */
  public verbose(message: string): void {
    if (!this.options.verbose || this.shouldSuppressOutput()) {
      return;
    }
    process.stdout.write(`[VERBOSE] ${message}\n`);
  }

  /**
   * Log job IDs and file paths - only in verbose mode
   */
  public logJobDetails(type: 'jobId' | 'filePath' | 'dcJobId', value: string): void {
    if (this.options.verbose && !this.shouldSuppressOutput()) {
      const label = type === 'jobId' ? 'Job ID' : type === 'dcJobId' ? 'DC Job ID' : 'File';
      process.stdout.write(`${label}: ${value}\n`);
    }
  }

  /**
   * Log progress messages - conditional based on flags and environment
   */
  public logProgress(message: string): void {
    if (!this.shouldSuppressOutput()) {
      process.stdout.write(message + '\n');
    }
  }

  /**
   * Log JSON output - only when --json flag is used
   */
  public json(data: unknown): void {
    if (this.options.json) {
      process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    }
  }

  /**
   * Always log errors - never suppressed
   */
  public error(message: string): void {
    process.stderr.write(`Error: ${message}\n`);
  }

  /**
   * Check if output should be suppressed
   */
  private shouldSuppressOutput(): boolean {
    return this.options.json || this.options.quiet || this.isProduction;
  }

  /**
   * Create spinner-safe logger that respects --json and production modes
   */
  public createSpinnerLogger() {
    return {
      shouldShowSpinner: !this.shouldSuppressOutput(),
      logProgress: (message: string) => {
        if (!this.shouldSuppressOutput()) {
          this.info(message);
        }
      }
    };
  }
}

/**
 * Factory function to create logger from command flags
 */
export function createLogger(flags: Record<string, unknown>): LoggingUtility {
  return new LoggingUtility({
    json: flags.json as boolean || false,
    quiet: flags.quiet as boolean || false,
    verbose: flags.verbose as boolean || false
  });
}

/**
 * Standard error message formatter
 */
export function formatError(operation: string, details?: string): string {
  const message = `Failed to ${operation}`;
  return details ? `${message}. ${details}` : `${message}.`;
}