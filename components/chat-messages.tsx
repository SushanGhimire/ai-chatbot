"use client";

import { ScrollArea } from "./ui/scroll-area";
import type { Message } from "./chat-interface";
import { Bot, User, FileText, ImageIcon, File, Star } from "lucide-react";
import { useEffect, useRef, Fragment } from "react";

interface ChatMessagesProps {
  messages: Message[];
  thinking: boolean;
}

const renderBoldText = (text: string) => {
  // Regex: Finds bold (**...**) OR STRICT URLs (http:// or https:// followed by non-space characters)
  const strictUrlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Combine bold and strict URL patterns for splitting
  const parts = text.split(/(\*\*.*?\*\*|(https?:\/\/[^\s]+))/g);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Check for Bold Text
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.substring(2, part.length - 2);
      return <strong key={index}>{boldContent}</strong>;
    }
    
    // 2. Check for STRICT URL
    if (part.match(strictUrlRegex)) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:underline" 
        >
          {part}
        </a>
      );
    }
    
    // 3. Regular Text
    return <Fragment key={index}>{part}</Fragment>;
  }).filter(Boolean);
};

// Helper function to handle ### headings and bold/link text
const renderHeadingsAndBold = (text: string) => {
  const headingRegex = /(^###\s+([^\n]+))/gm;
  const parts = text.split(headingRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Cleanup: Remove '---' and trim excessive whitespace/newlines
    const trimmedPart = part.replace(/^---$/gm, '').trim(); 
    
    if (!trimmedPart) return null;

    // Check if this is the captured heading content
    if (parts[index - 1] && parts[index - 1].startsWith('###')) {
      // Render it as an H3 and process it for bold/link text.
      return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{renderBoldText(trimmedPart)}</h3>;
    } 
    
    // Skip the full match part
    if (part.startsWith('###')) {
        return null;
    }
    
    // Regular text. Process it for bold/link text.
    return <Fragment key={index}>{renderBoldText(trimmedPart)}</Fragment>;
  }).filter(Boolean);
};


// Main helper function to parse markdown (code blocks -> headings -> bold/link)
const renderMarkdown = (text: string) => {
  const codeBlockParts = text.split(/```/g);

  return codeBlockParts.map((part, index) => {
    if (index % 2 === 1) {
      // This is the content *inside* the code block
      const newlineIndex = part.indexOf('\n');
      let codeContent = part;
      let language = '';

      if (newlineIndex > 0) {
        language = part.substring(0, newlineIndex).trim();
        codeContent = part.substring(newlineIndex + 1);
      } else {
        codeContent = part;
      }
      
      return (
        <pre key={index} className="my-2 p-3 rounded-lg bg-gray-800 text-white overflow-x-auto text-sm break-words whitespace-pre-wrap">
          {language && (
            <div className="text-xs text-gray-400 mb-1 select-none">{language}</div>
          )}
          <code>{codeContent}</code>
        </pre>
      );
    }
    
    // This is regular text. Process it for headings and bold/link text.
    return <Fragment key={index}>{renderHeadingsAndBold(part)}</Fragment>;
  });
};


export function ChatMessages({ messages, thinking }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">How can I help you today?</h2>
          <p className="text-muted-foreground">
            Start a conversation by typing a message or uploading files below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            )}

            <div
              className={`flex flex-col gap-2 max-w-[80%] ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap overflow-x-hidden break-words">
                  {renderMarkdown(message.content)}
                </div>
              </div>

              {/* File display logic */}
              {message.files && message.files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border"
                    >
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      ) : file.type === "application/pdf" ? (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <File className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-primary-foreground animate-spin" />
            </div>
            <span className="text-muted-foreground">thinking......</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}