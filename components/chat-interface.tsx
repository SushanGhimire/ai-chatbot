"use client";

import { useEffect, useState } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { Button } from "./ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import main from "@/app/callGemini";
import { callFileGemini } from "@/app/callFileGemini";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  timestamp: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export default function ChatInterface() {
  // to store all chat history and their messages
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [thinking, setThinking] = useState(false);
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    if (currentChatId === chatId && updatedChats.length > 0) {
      setCurrentChatId(updatedChats[0].id);
    } else if (updatedChats.length === 0) {
      createNewChat();
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChats(
      chats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  // Inside ChatInterface.tsx

  const sendMessage = async (content: string, files?: File[]) => {
    if (!currentChat) return;
    setThinking(true);

    // --- 1. PREPARE UI DATA (Metadata with local URL) ---
    const fileDataForUI: Message["files"] = files
      ? files.map((file) => ({
          // Use map, no need for Promise.all here
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
        }))
      : undefined;

    // ⭐️ Store the actual file object for the server
    const fileToUpload: File | null =
      files && files.length > 0 ? files[0] : null;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      files: fileDataForUI, // Use the UI data for the client message object
      timestamp: new Date(),
    };

    const updatedTitle =
      currentChat.messages.length === 0
        ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
        : currentChat.title;

    // First State Update: Add the user message immediately.
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title: updatedTitle,
            }
          : chat
      )
    );

    // --- 2. Initiate Gemini Request and Handle Response ---
    try {
      let geminiResponseText: any;

      if (fileToUpload) {
        // ⭐️ CORRECT: Pass the raw File/Blob object to the Server Action
        geminiResponseText = await callFileGemini(content, fileToUpload);
      } else {
        // No file, use the main text chat function
        geminiResponseText = await main(content);
      }

      // ... (Rest of the assistant message creation and state update is fine)
      const assistantMessage: Message = {
        // Use Message type instead of any
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: geminiResponseText,
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );
      setThinking(false);
    } catch (error) {
      // ... (Error handling is fine) ...
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {currentChat?.title || "New Chat"}
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </header>

        {/* Messages */}
        <div className="flex flex-col flex-1 overflow-auto h-screen">
          <ChatMessages
            messages={currentChat?.messages || []}
            thinking={thinking}
          />
        </div>
        {/* Input */}
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
