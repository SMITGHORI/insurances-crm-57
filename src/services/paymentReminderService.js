
import { toast } from 'sonner';

/**
 * Payment Reminder Service
 * Handles automated follow-up reminders for overdue payments
 * Integrates with email and WhatsApp for notifications
 */
class PaymentReminderService {
  constructor() {
    this.storageKey = 'paymentReminders';
    this.intervalId = null;
    this.reminderSchedules = {
      'first_reminder': 1, // 1 day after due date
      'second_reminder': 7, // 7 days after due date
      'final_reminder': 14, // 14 days after due date
      'escalation': 30 // 30 days after due date
    };
  }

  /**
   * Initialize the automated reminder system
   */
  initializeReminderSystem() {
    console.log('Initializing Payment Reminder System...');
    
    // Check for overdue payments every hour
    this.intervalId = setInterval(() => {
      this.processOverduePayments();
    }, 60 * 60 * 1000); // 1 hour interval

    // Run initial check
    this.processOverduePayments();
    
    toast.success('Payment reminder system activated');
  }

  /**
   * Stop the automated reminder system
   */
  stopReminderSystem() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Payment reminder system stopped');
    }
  }

  /**
   * Process overdue payments and send reminders
   */
  async processOverduePayments() {
    try {
      console.log('Processing overdue payments...');
      
      const invoices = this.getInvoicesData();
      const overdueInvoices = this.getOverdueInvoices(invoices);
      
      console.log(`Found ${overdueInvoices.length} overdue invoices`);
      
      for (const invoice of overdueInvoices) {
        await this.processInvoiceReminders(invoice);
      }
      
    } catch (error) {
      console.error('Error processing overdue payments:', error);
    }
  }

  /**
   * Get invoices data from localStorage
   */
  getInvoicesData() {
    try {
      const invoicesData = localStorage.getItem('invoicesData');
      return invoicesData ? JSON.parse(invoicesData) : [];
    } catch (error) {
      console.error('Error loading invoices data:', error);
      return [];
    }
  }

  /**
   * Get overdue invoices that need reminders
   */
  getOverdueInvoices(invoices) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return invoices.filter(invoice => {
      if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        return false;
      }
      
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today;
    });
  }

  /**
   * Process reminders for a specific invoice
   */
  async processInvoiceReminders(invoice) {
    const daysPastDue = this.getDaysPastDue(invoice.dueDate);
    const reminders = this.getInvoiceReminders(invoice.id);
    
    for (const [reminderType, daysThreshold] of Object.entries(this.reminderSchedules)) {
      if (daysPastDue >= daysThreshold && !this.hasReminderBeenSent(reminders, reminderType)) {
        await this.sendReminder(invoice, reminderType, daysPastDue);
        this.recordReminderSent(invoice.id, reminderType);
      }
    }
  }

  /**
   * Calculate days past due date
   */
  getDaysPastDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get reminder history for an invoice
   */
  getInvoiceReminders(invoiceId) {
    try {
      const remindersData = localStorage.getItem(this.storageKey);
      const allReminders = remindersData ? JSON.parse(remindersData) : {};
      return allReminders[invoiceId] || [];
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  }

  /**
   * Check if a specific reminder has been sent
   */
  hasReminderBeenSent(reminders, reminderType) {
    return reminders.some(reminder => reminder.type === reminderType);
  }

  /**
   * Send reminder via email and WhatsApp
   */
  async sendReminder(invoice, reminderType, daysPastDue) {
    try {
      console.log(`Sending ${reminderType} reminder for invoice ${invoice.invoiceNumber}`);
      
      const reminderContent = this.generateReminderContent(invoice, reminderType, daysPastDue);
      
      // Send email reminder
      await this.sendEmailReminder(invoice, reminderContent);
      
      // Send WhatsApp reminder
      await this.sendWhatsAppReminder(invoice, reminderContent);
      
      console.log(`${reminderType} reminder sent successfully for invoice ${invoice.invoiceNumber}`);
      
    } catch (error) {
      console.error(`Error sending ${reminderType} reminder:`, error);
    }
  }

  /**
   * Generate reminder content based on type
   */
  generateReminderContent(invoice, reminderType, daysPastDue) {
    const templates = {
      'first_reminder': {
        subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
        message: `Dear ${invoice.clientName},\n\nThis is a friendly reminder that payment for Invoice ${invoice.invoiceNumber} (₹${invoice.total}) was due ${daysPastDue} day(s) ago.\n\nPlease process the payment at your earliest convenience.\n\nThank you for your business.`
      },
      'second_reminder': {
        subject: `Second Payment Reminder - Invoice ${invoice.invoiceNumber}`,
        message: `Dear ${invoice.clientName},\n\nThis is a second reminder that payment for Invoice ${invoice.invoiceNumber} (₹${invoice.total}) is now ${daysPastDue} days overdue.\n\nPlease contact us if there are any issues with this payment.\n\nImmediate attention to this matter would be appreciated.`
      },
      'final_reminder': {
        subject: `Final Payment Reminder - Invoice ${invoice.invoiceNumber}`,
        message: `Dear ${invoice.clientName},\n\nThis is a final reminder that payment for Invoice ${invoice.invoiceNumber} (₹${invoice.total}) is now ${daysPastDue} days overdue.\n\nPlease process this payment immediately to avoid any service interruption.\n\nIf payment has already been made, please disregard this notice.`
      },
      'escalation': {
        subject: `Urgent: Overdue Payment - Invoice ${invoice.invoiceNumber}`,
        message: `Dear ${invoice.clientName},\n\nInvoice ${invoice.invoiceNumber} (₹${invoice.total}) is now ${daysPastDue} days overdue.\n\nThis matter requires immediate attention. Please contact our accounts department to resolve this issue.\n\nFurther action may be taken if payment is not received soon.`
      }
    };
    
    return templates[reminderType] || templates['first_reminder'];
  }

  /**
   * Send email reminder (simulated)
   */
  async sendEmailReminder(invoice, content) {
    // Simulate email sending
    const emailUrl = `mailto:${invoice.clientEmail}?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent(content.message)}`;
    
    // In a real implementation, this would call your email service
    console.log(`Email reminder sent to ${invoice.clientEmail}`);
    console.log(`Subject: ${content.subject}`);
    console.log(`Message: ${content.message}`);
    
    // For demo purposes, we'll just log the action
    return true;
  }

  /**
   * Send WhatsApp reminder (simulated)
   */
  async sendWhatsAppReminder(invoice, content) {
    const phone = invoice.clientPhone?.replace(/[^\d]/g, '');
    const whatsappText = encodeURIComponent(content.message);
    const whatsappUrl = `https://wa.me/${phone}?text=${whatsappText}`;
    
    // In a real implementation, this would call WhatsApp Business API
    console.log(`WhatsApp reminder sent to ${invoice.clientPhone}`);
    console.log(`Message: ${content.message}`);
    
    // For demo purposes, we'll just log the action
    return true;
  }

  /**
   * Record that a reminder has been sent
   */
  recordReminderSent(invoiceId, reminderType) {
    try {
      const remindersData = localStorage.getItem(this.storageKey);
      const allReminders = remindersData ? JSON.parse(remindersData) : {};
      
      if (!allReminders[invoiceId]) {
        allReminders[invoiceId] = [];
      }
      
      allReminders[invoiceId].push({
        type: reminderType,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
      
      localStorage.setItem(this.storageKey, JSON.stringify(allReminders));
      console.log(`Recorded ${reminderType} reminder for invoice ${invoiceId}`);
      
    } catch (error) {
      console.error('Error recording reminder:', error);
    }
  }

  /**
   * Get reminder statistics
   */
  getReminderStats() {
    try {
      const remindersData = localStorage.getItem(this.storageKey);
      const allReminders = remindersData ? JSON.parse(remindersData) : {};
      
      let totalReminders = 0;
      const remindersByType = {};
      
      Object.values(allReminders).forEach(invoiceReminders => {
        invoiceReminders.forEach(reminder => {
          totalReminders++;
          remindersByType[reminder.type] = (remindersByType[reminder.type] || 0) + 1;
        });
      });
      
      return {
        totalReminders,
        remindersByType,
        totalInvoicesWithReminders: Object.keys(allReminders).length
      };
      
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      return { totalReminders: 0, remindersByType: {}, totalInvoicesWithReminders: 0 };
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerManualReminderCheck() {
    console.log('Manual reminder check triggered');
    await this.processOverduePayments();
    toast.success('Manual reminder check completed');
  }

  /**
   * Clear all reminder history (for testing)
   */
  clearReminderHistory() {
    localStorage.removeItem(this.storageKey);
    console.log('Reminder history cleared');
    toast.success('Reminder history cleared');
  }
}

// Export singleton instance
export const paymentReminderService = new PaymentReminderService();
export default paymentReminderService;
