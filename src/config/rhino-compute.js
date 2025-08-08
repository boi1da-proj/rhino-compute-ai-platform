/**
 * Rhino.Compute Configuration
 * Manages connection settings for Rhino.Compute service and Grasshopper Hops
 */

module.exports = {
  // Base configuration
  baseUrl: process.env.RHINO_COMPUTE_URL || 'http://localhost:80',
  apiKey: process.env.RHINO_COMPUTE_API_KEY || 'p2robot-13a6-48f3-b24e-2025computeX',
  timeout: parseInt(process.env.RHINO_COMPUTE_TIMEOUT) || 30000,
  retryAttempts: parseInt(process.env.RHINO_COMPUTE_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.RHINO_COMPUTE_RETRY_DELAY) || 1000,
  localTestMode: process.env.LOCAL_TEST_MODE === 'true',
  
  // Grasshopper Hops configuration
  hops: {
    enabled: process.env.HOPS_ENABLED !== 'false',
    definitionsPath: process.env.HOPS_DEFINITIONS_PATH || '/grasshopper/definitions',
    timeout: parseInt(process.env.HOPS_TIMEOUT) || 60000,
    maxFileSize: parseInt(process.env.HOPS_MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    supportedFormats: ['gh', 'ghx', 'gho', 'gha']
  },
  
  // Compute plugins configuration
  plugins: {
    enabled: process.env.PLUGINS_ENABLED !== 'false',
    pluginsPath: process.env.PLUGINS_PATH || '/compute/plugins',
    autoLoad: process.env.PLUGINS_AUTO_LOAD !== 'false',
    timeout: parseInt(process.env.PLUGINS_TIMEOUT) || 45000,
    maxMemory: parseInt(process.env.PLUGINS_MAX_MEMORY) || 1024 * 1024 * 1024 // 1GB
  },
  
  // Performance configuration
  performance: {
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 10,
    requestQueueSize: parseInt(process.env.REQUEST_QUEUE_SIZE) || 100,
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600000, // 1 hour
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false'
  },
  
  // Security configuration
  security: {
    enableSSL: process.env.ENABLE_SSL === 'true',
    verifySSL: process.env.VERIFY_SSL !== 'false',
    apiKeyRequired: process.env.API_KEY_REQUIRED !== 'false',
    rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 1000
  },
  
  // Logging configuration
  logging: {
    enabled: process.env.LOGGING_ENABLED !== 'false',
    level: process.env.LOG_LEVEL || 'info',
    includeRequestData: process.env.LOG_INCLUDE_REQUEST_DATA === 'true',
    includeResponseData: process.env.LOG_INCLUDE_RESPONSE_DATA === 'true',
    logFilePath: process.env.LOG_FILE_PATH || './logs/rhino-compute.log'
  },
  
  // Error handling configuration
  errorHandling: {
    enableCircuitBreaker: process.env.ENABLE_CIRCUIT_BREAKER !== 'false',
    circuitBreakerThreshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
    circuitBreakerTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000,
    enableRetry: process.env.ENABLE_RETRY !== 'false',
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryBackoff: process.env.RETRY_BACKOFF || 'exponential'
  },
  
  // Monitoring configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    performanceMetrics: {
      enabled: process.env.PERFORMANCE_METRICS_ENABLED !== 'false',
      collectResponseTimes: process.env.COLLECT_RESPONSE_TIMES !== 'false',
      collectMemoryUsage: process.env.COLLECT_MEMORY_USAGE !== 'false',
      collectErrorRates: process.env.COLLECT_ERROR_RATES !== 'false'
    }
  },
  
  // Development configuration
  development: {
    debugMode: process.env.DEBUG_MODE === 'true',
    mockResponses: process.env.MOCK_RESPONSES === 'true',
    mockDataPath: process.env.MOCK_DATA_PATH || './test/mock-data',
    enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true'
  },
  
  // Azure VM specific configuration
  azure: {
    vmDeployment: process.env.AZURE_VM_DEPLOYMENT === 'true',
    vmResourceGroup: process.env.AZURE_VM_RESOURCE_GROUP || 'soft-vm-rg',
    vmName: process.env.AZURE_VM_NAME || 'soft-vm',
    vmIP: process.env.AZURE_VM_IP,
    vmPort: parseInt(process.env.AZURE_VM_PORT) || 80,
    vmUsername: process.env.AZURE_VM_USERNAME || 'azureuser',
    vmSSHKey: process.env.AZURE_VM_SSH_KEY || '~/.ssh/id_rsa'
  },
  
  // Domain configuration
  domain: {
    primaryDomain: process.env.PRIMARY_DOMAIN || 'www.softlyplease.com',
    sslEnabled: process.env.SSL_ENABLED === 'true',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'https://www.softlyplease.com',
      'http://localhost:3000',
      'http://localhost:80'
    ]
  }
};
