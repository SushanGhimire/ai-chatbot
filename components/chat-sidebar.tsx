"use client"

import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { MessageSquarePlus, Trash2, X, Pencil, Check } from "lucide-react"
import type { Chat } from "./chat-interface"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId)
    setEditTitle(currentTitle)
  }

  const saveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const cancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Chat History</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button onClick={onNewChat} className="w-full justify-start gap-2 bg-transparent" variant="outline">
              <MessageSquarePlus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    currentChatId === chat.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-sidebar-foreground",
                    editingChatId !== chat.id && "cursor-pointer",
                  )}
                  onClick={() => {
                    if (editingChatId !== chat.id) {
                      onSelectChat(chat.id)
                      onClose()
                    }
                  }}
                >
                  {editingChatId === chat.id ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEdit(chat.id)
                          } else if (e.key === "Escape") {
                            cancelEdit()
                          }
                        }}
                        className="flex-1 text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          saveEdit(chat.id)
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          cancelEdit()
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm truncate">{chat.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditing(chat.id, chat.title)
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">AI Chatbot Interface</p>
          </div>
        </div>
      </aside>
    </>
  )
}
