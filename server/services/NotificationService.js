import EventEmitter from 'events';

class NotificationEmitter extends EventEmitter {}
const NotificationService = new NotificationEmitter();

// Mock Notification Definitions
NotificationService.on('sessionBooked', (session) => {
  console.log(`\n🛎️  [EVENT MOCK EMAIL] Session Booked! Sending email to Student (${session.student}) and Mentor (${session.mentor})...\n`);
});

NotificationService.on('sessionConfirmed', (session) => {
  console.log(`\n✅  [EVENT MOCK EMAIL] Session Confirmed! Sending Meeting Link (${session.meetingLink}) to participants...\n`);
});

NotificationService.on('sessionCancelled', (session) => {
  console.log(`\n❌  [EVENT MOCK EMAIL] Session Cancelled! Notifying participants of cancellation...\n`);
});

NotificationService.on('sessionReminder', (session) => {
  console.log(`\n⏳  [EVENT MOCK SMS] Reminder: Session ${session._id} starts in 10 minutes!\n`);
});

export default NotificationService;
