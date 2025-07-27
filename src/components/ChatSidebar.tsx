import { useState } from 'react'
import { Plus, MessageSquare, Trash2, Menu, X, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface ChatThread {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface ChatSidebarProps {
  threads: ChatThread[]
  activeThreadId?: string
  onSelectThread: (threadId: string) => void
  onNewChat: () => void
  onDeleteThread: (threadId: string) => void
  isMobile?: boolean
}

function SidebarContent({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  onNewChat, 
  onDeleteThread 
}: Omit<ChatSidebarProps, 'isMobile'>) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-6 h-6 text-accent-teal" />
          <h2 className="font-semibold gradient-text">FindexAI</h2>
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full bg-accent-gradient text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat Threads */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h3>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {threads.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No chat history</p>
              </div>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group glass-card p-3 cursor-pointer transition-all hover:bg-accent/10 ${
                    activeThreadId === thread.id ? 'ring-2 ring-accent-teal/50 bg-accent/5' : ''
                  }`}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {thread.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {thread.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{thread.messageCount} messages</span>
                        <span>•</span>
                        <span>{thread.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteThread(thread.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export function ChatSidebar(props: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (props.isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="glass-card">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="glass-card w-80 p-0">
          <SidebarContent {...props} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="w-80 h-full glass-card">
      <SidebarContent {...props} />
    </div>
  )
}