
const WebSocketManager = require('./websocket');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      responseTime: [],
      errorRate: [],
      throughput: []
    };
    
    this.alertThresholds = {
      slowResponse: 2000, // 2 seconds
      highErrorRate: 0.1, // 10%
      lowThroughput: 10 // requests per minute
    };

    // Clean up old metrics every hour
    setInterval(() => this.cleanupMetrics(), 60 * 60 * 1000);
  }

  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      req.requestId = requestId;
      req.startTime = startTime;

      // Track request
      this.metrics.requests.set(requestId, {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?._id,
        startTime
      });

      const originalSend = res.send;
      res.send = function(data) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Record performance metrics
        this.recordMetrics(req, res, duration);
        
        return originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }

  recordMetrics(req, res, duration) {
    const now = Date.now();
    
    // Record response time
    this.metrics.responseTime.push({
      timestamp: now,
      duration,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode
    });

    // Record error rate
    if (res.statusCode >= 400) {
      this.metrics.errorRate.push({
        timestamp: now,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        error: true
      });
    }

    // Record throughput
    this.metrics.throughput.push({
      timestamp: now,
      path: req.path,
      method: req.method
    });

    // Check alerts
    this.checkAlerts(duration, res.statusCode, req.path);

    // Clean up request tracking
    this.metrics.requests.delete(req.requestId);
  }

  checkAlerts(duration, statusCode, path) {
    // Slow response alert
    if (duration > this.alertThresholds.slowResponse) {
      this.sendAlert('slow_response', {
        path,
        duration,
        threshold: this.alertThresholds.slowResponse
      });
    }

    // High error rate alert (check last 100 requests)
    const recentErrors = this.metrics.errorRate
      .filter(e => Date.now() - e.timestamp < 5 * 60 * 1000) // Last 5 minutes
      .length;
    
    const recentRequests = this.metrics.throughput
      .filter(t => Date.now() - t.timestamp < 5 * 60 * 1000) // Last 5 minutes
      .length;

    if (recentRequests > 10 && recentErrors / recentRequests > this.alertThresholds.highErrorRate) {
      this.sendAlert('high_error_rate', {
        errorRate: (recentErrors / recentRequests * 100).toFixed(2) + '%',
        period: '5 minutes'
      });
    }
  }

  sendAlert(type, details) {
    const alert = {
      type,
      details,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    };

    console.warn('Performance Alert:', alert);
    
    // Send real-time alert to admins
    WebSocketManager.emitToRole('super_admin', 'performance-alert', alert);
  }

  getAlertSeverity(type) {
    switch (type) {
      case 'slow_response': return 'medium';
      case 'high_error_rate': return 'high';
      case 'low_throughput': return 'medium';
      default: return 'low';
    }
  }

  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getMetrics(timeframe = '1h') {
    const now = Date.now();
    const timeframes = {
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };
    
    const since = now - (timeframes[timeframe] || timeframes['1h']);

    const responseMetrics = this.metrics.responseTime.filter(r => r.timestamp >= since);
    const errorMetrics = this.metrics.errorRate.filter(e => e.timestamp >= since);
    const throughputMetrics = this.metrics.throughput.filter(t => t.timestamp >= since);

    return {
      responseTime: {
        average: responseMetrics.reduce((sum, r) => sum + r.duration, 0) / responseMetrics.length || 0,
        min: Math.min(...responseMetrics.map(r => r.duration)) || 0,
        max: Math.max(...responseMetrics.map(r => r.duration)) || 0,
        p95: this.calculatePercentile(responseMetrics.map(r => r.duration), 95) || 0
      },
      errorRate: {
        total: errorMetrics.length,
        rate: errorMetrics.length / throughputMetrics.length || 0,
        byStatusCode: this.groupBy(errorMetrics, 'statusCode')
      },
      throughput: {
        total: throughputMetrics.length,
        rpm: throughputMetrics.length / (timeframes[timeframe] / (60 * 1000)), // requests per minute
        byEndpoint: this.groupBy(throughputMetrics, 'path')
      },
      activeRequests: this.metrics.requests.size
    };
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
    return sorted[index];
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  cleanupMetrics() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    this.metrics.responseTime = this.metrics.responseTime.filter(r => r.timestamp >= oneHourAgo);
    this.metrics.errorRate = this.metrics.errorRate.filter(e => e.timestamp >= oneHourAgo);
    this.metrics.throughput = this.metrics.throughput.filter(t => t.timestamp >= oneHourAgo);
  }
}

module.exports = new PerformanceMonitor();
