
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Mail, Eye, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const QuotationSend = ({ quotationId }) => {
  const [emailData, setEmailData] = useState({
    to: 'john.doe@email.com',
    subject: 'Your Insurance Quotation - QT-2025-0001',
    message: 'Dear John,\n\nPlease find attached your insurance quotation. We have prepared a comprehensive plan that meets your requirements.\n\nIf you have any questions, please feel free to contact us.\n\nBest regards,\nAgent Smith'
  });

  const [sendHistory] = useState([
    {
      id: '1',
      sentAt: '2025-06-02T10:30:00Z',
      to: 'john.doe@email.com',
      status: 'delivered',
      openedAt: '2025-06-02T11:15:00Z'
    },
    {
      id: '2',
      sentAt: '2025-06-01T15:45:00Z',
      to: 'john.doe@email.com',
      status: 'delivered',
      openedAt: null
    }
  ]);

  const handleSendQuotation = () => {
    // In a real app, this would call the API
    toast.success('Quotation sent successfully!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <Mail className="h-4 w-4 text-green-500" />;
      case 'opened': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'failed': return <Clock className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Send Quotation</h3>
        <p className="text-sm text-gray-600">Send quotation via email to client</p>
      </div>

      {/* Send Email Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send via Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Email
            </label>
            <Input
              value={emailData.to}
              onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              placeholder="client@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <Input
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Email message"
              rows={6}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              Save as Template
            </Button>
            <Button onClick={handleSendQuotation}>
              <Send className="mr-2 h-4 w-4" />
              Send Quotation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Send History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Send History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sendHistory.map(record => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(record.status)}
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="font-medium">{record.to}</p>
                    <p className="text-sm text-gray-500">
                      Sent: {formatDate(record.sentAt)}
                    </p>
                    {record.openedAt && (
                      <p className="text-sm text-gray-500">
                        Opened: {formatDate(record.openedAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Resend
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <h4 className="font-medium">Standard Quotation</h4>
              <p className="text-sm text-gray-600">Default template for sending quotations</p>
            </div>
            
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <h4 className="font-medium">Follow-up Reminder</h4>
              <p className="text-sm text-gray-600">Template for follow-up communications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationSend;
