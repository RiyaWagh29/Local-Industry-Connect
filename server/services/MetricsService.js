import logger from '../utils/logger.js';

class MetricsManager {
  constructor() {
    this.counters = {
      admin_user_promotions: 0,
      admin_user_suspensions: 0,
      admin_bulk_cancellations: 0,
      admin_session_cancellations: 0,
      admin_csv_exports: 0,
    };
  }

  increment(metricName, value = 1) {
    if (this.counters.hasOwnProperty(metricName)) {
      this.counters[metricName] += value;
      logger.info(`[METRIC] ${metricName} increased by ${value}. Current: ${this.counters[metricName]}`);
    }
  }

  getSnapshot() {
    return {
      ...this.counters,
      uptime: process.uptime(),
      timestamp: new Date(),
    };
  }
}

const MetricsService = new MetricsManager();
export default MetricsService;
