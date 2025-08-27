import { env } from "./environment"

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.sessionId,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Send to external logging service in production
    if (env.isProduction() && env.get("ERROR_REPORTING_ENABLED")) {
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    try {
      // In a real app, this would send to services like Sentry, LogRocket, etc.
      console.log("Sending log to external service:", entry)
    } catch (error) {
      console.error("Failed to send log to external service:", error)
    }
  }

  debug(message: string, data?: any) {
    if (env.get("DEBUG_MODE")) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data)
      this.addLog(entry)
      console.debug(`[DEBUG] ${message}`, data)
    }
  }

  info(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, data)
    this.addLog(entry)
    console.info(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, data)
    this.addLog(entry)
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: Error | any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, {
      error: error?.message || error,
      stack: error?.stack,
    })
    this.addLog(entry)
    console.error(`[ERROR] ${message}`, error)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level >= level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new Logger()
