interface LogEntry {
  level: 'info' | 'error' | 'warn';
  message: string;
  meta?: any;
  timestamp: string;
}

export class Logger {
  private log(entry: LogEntry) {
    const logOutput = JSON.stringify(entry, null, 2);
    if (entry.level === 'error') {
      console.error(logOutput);
    } else {
      console.log(logOutput);
    }
  }

  info(message: string, meta?: any) {
    this.log({
      level: 'info',
      message,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string, meta?: any) {
    this.log({
      level: 'error',
      message,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, meta?: any) {
    this.log({
      level: 'warn',
      message,
      meta,
      timestamp: new Date().toISOString(),
    });
  }
}

export const logger = new Logger();
