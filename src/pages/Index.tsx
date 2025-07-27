import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/ChatInterface'
import { ChatSidebar } from '@/components/ChatSidebar'
import { SettingsModal } from '@/components/SettingsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'
import { useChatStorage, Message } from '@/hooks/useChatStorage'
import { useIsMobile } from '@/hooks/use-mobile'
import { useToast } from '@/hooks/use-toast'

function ChatApp() {
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useIsMobile()
  const { toast } = useToast()
  
  const {
    threads,
    activeThreadId,
    settings,
    getActiveThread,
    createNewThread,
    addMessage,
    deleteThread,
    clearCurrentThread,
    setActiveThreadId,
    setSettings
  } = useChatStorage()

  // Create initial thread if none exists
  useEffect(() => {
    if (threads.length === 0 || !activeThreadId) {
      createNewThread()
    }
  }, [])

  const activeThread = getActiveThread()
  const messages = activeThread?.messages || []

  const handleSendMessage = async (content: string, agent: string, url?: string): Promise<string> => {
    if (!activeThreadId) {
      const newThreadId = createNewThread()
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content,
      timestamp: new Date(),
      agent,
      url
    }

    addMessage(activeThreadId!, userMessage)
    setIsLoading(true)

    try {
      // Simulate API call to FindexAI backend
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = `I understand you're asking about "${content}". This would normally be processed by the ${agent} agent${url ? ` using ${url}` : ''} and return a comprehensive response based on the ${settings.provider} ${settings.model} model.`

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        agent,
        url
      }

      addMessage(activeThreadId!, aiMessage)
      return aiResponse
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    createNewThread()
  }

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId)
  }

  const transformedThreads = threads.map(thread => ({
    id: thread.id,
    title: thread.title,
    lastMessage: thread.lastMessage,
    timestamp: thread.timestamp,
    messageCount: thread.messageCount
  }))

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {!isMobile && (
        <ChatSidebar
          threads={transformedThreads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onNewChat={handleNewChat}
          onDeleteThread={deleteThread}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass-card p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            {isMobile && (
              <ChatSidebar
                threads={transformedThreads}
                activeThreadId={activeThreadId}
                onSelectThread={handleSelectThread}
                onNewChat={handleNewChat}
                onDeleteThread={deleteThread}
                isMobile={true}
              />
            )}
            <h1 className="text-lg font-semibold gradient-text">
              {activeThread?.title || 'FindexAI Chat'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <SettingsModal 
              settings={settings} 
              onSettingsChange={setSettings} 
            />
            <ThemeToggle />
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            onSendMessage={handleSendMessage}
            currentAgent={settings.agent}
            currentUrl={settings.url}
            messages={messages}
            isLoading={isLoading}
            onAgentChange={(agent) => setSettings(prev => ({ ...prev, agent }))}
            onUrlChange={(url) => setSettings(prev => ({ ...prev, url }))}
          />
        </div>
      </div>
    </div>
  )
}

const Index = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="findex-ui-theme">
      <ChatApp />
    </ThemeProvider>
  )
};

export default Index;
