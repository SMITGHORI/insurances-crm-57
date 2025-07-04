
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

class RateLimiterManager {
  constructor() {
    this.redisClient = null;
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true
          }
        });
        
        // Set up error handlers
        this.redisClient.on('error', (err) => {
          console.warn('Redis connection error:', err.message);
          this.redisClient = null;
        });
        
        // Try to connect with timeout
        const connectPromise = this.redisClient.connect();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        );
        
        await Promise.race([connectPromise, timeoutPromise]);
        console.log('Redis connected for rate limiting');
      } else {
        console.log('No Redis URL provided, using memory store for rate limiting');
      }
    } catch (error) {
      console.warn('Redis not available, using memory store for rate limiting:', error.message);
      this.redisClient = null;
    }
  }

  createLimiter(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000) || 900
      },
      standardHeaders: true,
      legacyHeaders: false,
      ...options
    };

    if (this.redisClient) {
      defaultOptions.store = new RedisStore({
        sendCommand: (...args) => this.redisClient.sendCommand(args),
      });
    }

    return rateLimit(defaultOptions);
  }

  // Different rate limits for different endpoints
  getGeneralLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per 15 minutes
    });
  }

  getAuthLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Temporarily increased for testing
      skipSuccessfulRequests: true,
      message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 900
      }
    });
  }

  getAPILimiter() {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // 30 API calls per minute
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user ? `user:${req.user._id}` : req.ip;
      }
    });
  }

  getUploadLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      message: {
        error: 'Upload limit exceeded, please try again later.',
        retryAfter: 3600
      }
    });
  }

  getBulkOperationLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // 5 bulk operations per hour
      message: {
        error: 'Bulk operation limit exceeded, please try again later.',
        retryAfter: 3600
      }
    });
  }

  getSearchLimiter() {
    return this.createLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20, // 20 searches per minute
      keyGenerator: (req) => {
        return req.user ? `search:user:${req.user._id}` : `search:ip:${req.ip}`;
      }
    });
  }
}

module.exports = new RateLimiterManager();
