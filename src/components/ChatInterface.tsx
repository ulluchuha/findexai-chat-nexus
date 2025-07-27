import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Copy, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: Date
  agent?: string
  url?: string
}

interface ChatInterfaceProps {
  onSendMessage: (message: string, agent: string, url?: string) => Promise<string>
  currentAgent: string
  currentUrl?: string
  messages: Message[]
  isLoading: boolean
}

export function ChatInterface({ 
  onSendMessage, 
  currentAgent, 
  currentUrl, 
  messages, 
  isLoading 
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    
    try {
      await onSendMessage(message, currentAgent, currentUrl)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard."
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard.",
        variant: "destructive"
      })
    }
  }

  const formatMessage = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index} className="leading-relaxed">
          {line || <br />}
        </div>
      ))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 smooth-scroll">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold gradient-text">Welcome to FindexAI</h3>
            <p className="text-muted-foreground mt-2">
              Start a conversation with your AI assistant
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble-enter ${
                message.sender === 'user' ? 'ml-auto' : 'mr-auto'
              } max-w-[80%]`}
            >
              <div
                className={`glass-card p-4 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5 text-accent-teal" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">
                      {message.sender === 'user' ? 'You' : 'FindexAI'}
                      {message.agent && message.sender === 'ai' && (
                        <span className="ml-2 text-xs opacity-75">
                          via {message.agent}
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <time className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </time>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="chat-bubble-enter mr-auto max-w-[80%]">
            <div className="glass-card p-4 bg-card">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-accent-teal mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">FindexAI</div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="glass-input resize-none min-h-[44px] max-h-32"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-accent-gradient border-0 text-white"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {currentAgent !== 'React Agent' && currentUrl && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span>Using {currentAgent} agent with:</span>
            <span className="text-accent-teal font-mono">{currentUrl}</span>
          </div>
        )}
      </div>
    </div>
  )
}