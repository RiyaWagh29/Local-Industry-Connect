import cron from 'node-cron';
import mongoose from 'mongoose';
import Session from '../models/Session.js';
import NotificationService from './NotificationService.js';

class SchedulerService {
  start() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      console.log('[Scheduler] Running 10-minute reminder job...');
      
      // Skip cron work if DB is not connected (avoid noisy errors in dev)
      if (mongoose.connection.readyState !== 1) {
        return;
      }

      const now = new Date();
      // Calculate exactly ten minutes from now
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);
      
      // Window check (between now and 10 mins from now)
      try {
        const upcomingSessions = await Session.find({
          status: 'confirmed',
          start: { $lte: tenMinutesFromNow, $gt: now }
        });

        upcomingSessions.forEach(session => {
          NotificationService.emit('sessionReminder', session);
        });

      } catch (error) {
        console.error('[SchedulerError] Failed to execute cron query', error);
      }
    });

    console.log('[Scheduler] Background services activated.');
  }
}

export default new SchedulerService();
