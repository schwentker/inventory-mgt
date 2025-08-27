export interface EnvironmentConfig {
  NODE_ENV: "development" | "production" | "test"
  APP_VERSION: string
  BUILD_TIME: string
  ANALYTICS_ENABLED: boolean
  ERROR_REPORTING_ENABLED: boolean
  PERFORMANCE_MONITORING_ENABLED: boolean
  DEBUG_MODE: boolean
  API_BASE_URL: string
}

class Environment {
  private config: EnvironmentConfig

  constructor() {
    this.config = {
      NODE_ENV: (process.env.NODE_ENV as any) || "development",
      APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
      ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
      ERROR_REPORTING_ENABLED: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENABLED === "true",
      PERFORMANCE_MONITORING_ENABLED: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED === "true",
      DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
      API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    }
  }

  get(key: keyof EnvironmentConfig) {
    return this.config[key]
  }

  isDevelopment() {
    return this.config.NODE_ENV === "development"
  }

  isProduction() {
    return this.config.NODE_ENV === "production"
  }

  isTest() {
    return this.config.NODE_ENV === "test"
  }

  getConfig() {
    return { ...this.config }
  }
}

export const env = new Environment()
