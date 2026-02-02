import React from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface AIChatBoxProps {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  height?: string;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
}

export function AIChatBox(props: AIChatBoxProps) {
  const { 
    messages = [], 
    onSendMessage, 
    isLoading = false, 
    placeholder = "Digite sua mensagem...",
    height = "400px",
    emptyStateMessage = "Inicie uma conversa",
    suggestedPrompts = []
  } = props;

  return (
    <div className="p-4 border rounded-lg bg-card" style={{ height }}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{emptyStateMessage}</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))
          )}
        </div>
        {suggestedPrompts.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
                onClick={() => onSendMessage?.(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        <input 
          type="text" 
          placeholder={placeholder}
          className="w-full p-2 border rounded bg-background"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              onSendMessage?.(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}

export default AIChatBox;
