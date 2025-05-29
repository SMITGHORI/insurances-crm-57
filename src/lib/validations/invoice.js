
import * as z from 'zod';

export const InvoiceSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.date(),
  dueDate: z.date(),
  totalAmount: z.number().min(0, "Total amount must be positive"),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
});
