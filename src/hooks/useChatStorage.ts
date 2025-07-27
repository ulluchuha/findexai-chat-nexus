import { useLocalStorage } from './useLocalStorage'

export interface Message {
  id: string
  sender: 'user' | 'ai'
  content: string
  timestamp: Date
  agent?: string
  url?: string
}

export interface ChatThread {
  id: string
  title: string
  messages: Message[]
  lastMessage: string
  timestamp: Date
  messageCount: number
}

export interface Settings {
  agent: string
  provider: string
  model: string
  url?: string
  apiKeys: {
    openai?: string
    gemini?: string
    claude?: string
    ollama?: string
    deepseek?: string
    openrouter?: string
  }
  endpoints: {
    ollama?: string
    openrouter?: string
  }
}

export function useChatStorage() {
  const [threads, setThreads] = useLocalStorage<ChatThread[]>('findex-chat-threads', [])
  const [activeThreadId, setActiveThreadId] = useLocalStorage<string | undefined>('findex-active-thread', undefined)
  const [settings, setSettings] = useLocalStorage<Settings>('findex-settings', {
    agent: 'react',
    provider: 'openai',
    model: 'gpt-4.1',
    apiKeys: {},
    endpoints: {}
  })

  const getActiveThread = () => {
    return threads.find(thread => thread.id === activeThreadId)
  }

  const createNewThread = (): string => {
    const newThreadId = `thread-${Date.now()}`
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New Chat',
      messages: [],
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0
    }
    
    setThreads(prev => [newThread, ...prev])
    setActiveThreadId(newThreadId)
    return newThreadId
  }

  const addMessage = (threadId: string, message: Message) => {
    setThreads(prev => 
      prev.map(thread => {
        if (thread.id === threadId) {
          const updatedMessages = [...thread.messages, message]
          const isFirstMessage = thread.messages.length === 0
          
          return {
            ...thread,
            messages: updatedMessages,
            lastMessage: message.content.slice(0, 100),
            timestamp: new Date(),
            messageCount: updatedMessages.length,
            title: isFirstMessage ? generateThreadTitle(message.content) : thread.title
          }
        }
        return thread
      })
    )
  }

  const deleteThread = (threadId: string) => {
    setThreads(prev => prev.filter(thread => thread.id !== threadId))
    if (activeThreadId === threadId) {
      const remainingThreads = threads.filter(thread => thread.id !== threadId)
      setActiveThreadId(remainingThreads.length > 0 ? remainingThreads[0].id : undefined)
    }
  }

  const clearCurrentThread = () => {
    if (activeThreadId) {
      setThreads(prev =>
        prev.map(thread => {
          if (thread.id === activeThreadId) {
            return {
              ...thread,
              messages: [],
              lastMessage: '',
              messageCount: 0,
              title: 'New Chat'
            }
          }
          return thread
        })
      )
    }
  }

  return {
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
  }
}

function generateThreadTitle(firstMessage: string): string {
  // Generate a title from the first message (first 3-5 words)
  const words = firstMessage.trim().split(' ').slice(0, 4)
  return words.join(' ') + (words.length < firstMessage.trim().split(' ').length ? '...' : '')
}