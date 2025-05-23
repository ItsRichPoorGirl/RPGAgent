import React from 'react';
import { MarkdownRenderer } from '@/components/file-renderers/markdown-renderer';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp?: string;
  avatarUrl?: string;
  attachments?: React.ReactNode;
  isError?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  sender,
  content,
  timestamp,
  avatarUrl,
  attachments,
  isError = false,
}) => {
  return (
    <div
      className={cn(
        'flex w-full my-2',
        sender === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {sender !== 'user' && (
        <div className="flex-shrink-0 mr-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={sender}
              className="w-8 h-8 rounded-full border border-muted"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {sender === 'agent' ? 'A' : sender === 'system' ? 'S' : 'U'}
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          'rounded-xl px-4 py-3 max-w-[80%] shadow-md',
          sender === 'user'
            ? 'bg-primary text-primary-foreground ml-auto'
            : sender === 'agent'
            ? 'bg-muted/80 text-foreground'
            : 'bg-yellow-50 border border-yellow-300 text-yellow-900',
          isError && 'border border-red-500 bg-red-50 text-red-900'
        )}
      >
        <MarkdownRenderer content={content} />
        {attachments && <div className="mt-2">{attachments}</div>}
        {timestamp && (
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {timestamp}
          </div>
        )}
      </div>
      {sender === 'user' && (
        <div className="flex-shrink-0 ml-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={sender}
              className="w-8 h-8 rounded-full border border-muted"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              U
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 