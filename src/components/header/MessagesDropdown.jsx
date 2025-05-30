
import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MessagesDropdown = () => {
  const navigate = useNavigate();
  const [messages] = useState([
    {
      id: 1,
      sender: 'John Client',
      subject: 'Policy Renewal Query',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      sender: 'Sarah Agent',
      subject: 'New Lead Assignment',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      sender: 'Mike Manager',
      subject: 'Monthly Report Review',
      time: '3 hours ago',
      unread: false
    }
  ]);

  const unreadCount = messages.filter(msg => msg.unread).length;

  const handleMessageClick = (messageId) => {
    console.log('Opening message:', messageId);
    // In a real app, this would navigate to a message detail page
  };

  const handleViewAllMessages = () => {
    console.log('Viewing all messages');
    // Navigate to messages page when implemented
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative"
        >
          <Mail className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Messages</span>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {messages.map((message) => (
          <DropdownMenuItem 
            key={message.id}
            className="flex flex-col items-start p-4 cursor-pointer"
            onClick={() => handleMessageClick(message.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium text-sm">{message.sender}</span>
                {message.unread && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </div>
              <span className="text-xs text-gray-500">{message.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate w-full">{message.subject}</p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-center py-3 cursor-pointer"
          onClick={handleViewAllMessages}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          View All Messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessagesDropdown;
