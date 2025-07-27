import { useState, useEffect } from 'react'
import { Settings, Upload, Link, FileText, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Settings {
  agent: string
  model: string
  url?: string
  apiKeys: {
    openai?: string
    gemini?: string
    ollama?: string
  }
  ollamaEndpoint?: string
}

interface SettingsModalProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

const AGENTS = [
  { id: 'react', name: 'React Agent', requiresUrl: false, icon: '⚛️' },
  { id: 'youtube', name: 'YouTube', requiresUrl: true, icon: '📺' },
  { id: 'github', name: 'GitHub', requiresUrl: true, icon: '🐙' },
  { id: 'website', name: 'Website', requiresUrl: true, icon: '🌐' },
  { id: 'web-scroller', name: 'Web Scroller', requiresUrl: true, icon: '📜' },
  { id: 'docs', name: 'Docs', requiresUrl: false, icon: '📚' },
]

const MODELS = [
  { id: 'openai-gpt4', name: 'OpenAI (GPT-4.1)', provider: 'openai' },
  { id: 'gemini', name: 'Gemini', provider: 'gemini' },
  { id: 'ollama', name: 'Ollama', provider: 'ollama' },
]

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const selectedAgent = AGENTS.find(a => a.id === localSettings.agent) || AGENTS[0]
  const selectedModel = MODELS.find(m => m.id === localSettings.model) || MODELS[0]

  const handleSave = () => {
    // Validate required fields
    if (selectedAgent.requiresUrl && !localSettings.url) {
      toast({
        title: "Missing URL",
        description: `${selectedAgent.name} agent requires a URL.`,
        variant: "destructive"
      })
      return
    }

    if (selectedModel.provider === 'openai' && !localSettings.apiKeys.openai) {
      toast({
        title: "Missing API Key",
        description: "OpenAI API key is required for GPT-4.1.",
        variant: "destructive"
      })
      return
    }

    if (selectedModel.provider === 'gemini' && !localSettings.apiKeys.gemini) {
      toast({
        title: "Missing API Key",
        description: "Gemini API key is required.",
        variant: "destructive"
      })
      return
    }

    if (selectedModel.provider === 'ollama' && !localSettings.ollamaEndpoint) {
      toast({
        title: "Missing Endpoint",
        description: "Ollama endpoint URL is required.",
        variant: "destructive"
      })
      return
    }

    onSettingsChange(localSettings)
    setIsOpen(false)
    toast({
      title: "Settings saved",
      description: "Your preferences have been saved successfully."
    })
  }

  const handleClearAll = () => {
    const clearedSettings: Settings = {
      agent: 'react',
      model: 'openai-gpt4',
      apiKeys: {},
    }
    setLocalSettings(clearedSettings)
    onSettingsChange(clearedSettings)
    toast({
      title: "Settings cleared",
      description: "All settings and API keys have been cleared."
    })
  }

  const updateSetting = (key: keyof Settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const updateApiKey = (provider: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: value }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="glass-card">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text">AI Assistant Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent">AI Agent</Label>
            <Select
              value={localSettings.agent}
              onValueChange={(value) => updateSetting('agent', value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <span>{agent.icon}</span>
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL Input (conditional) */}
          {selectedAgent.requiresUrl && (
            <div className="space-y-2">
              <Label htmlFor="url">
                <Link className="w-4 h-4 inline mr-1" />
                URL for {selectedAgent.name}
              </Label>
              <Input
                id="url"
                value={localSettings.url || ''}
                onChange={(e) => updateSetting('url', e.target.value)}
                placeholder="https://..."
                className="glass-input"
              />
            </div>
          )}

          {/* Document Upload (for Docs agent) */}
          {localSettings.agent === 'docs' && (
            <div className="space-y-2">
              <Label>
                <FileText className="w-4 h-4 inline mr-1" />
                Document Upload
              </Label>
              <div className="glass-input p-4 text-center border-dashed">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, TXT, DOCX, MD
                </p>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Language Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => updateSetting('model', value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key Inputs */}
          {selectedModel.provider === 'openai' && (
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={localSettings.apiKeys.openai || ''}
                onChange={(e) => updateApiKey('openai', e.target.value)}
                placeholder="sk-..."
                className="glass-input"
              />
            </div>
          )}

          {selectedModel.provider === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input
                id="gemini-key"
                type="password"
                value={localSettings.apiKeys.gemini || ''}
                onChange={(e) => updateApiKey('gemini', e.target.value)}
                placeholder="AI..."
                className="glass-input"
              />
            </div>
          )}

          {selectedModel.provider === 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
              <Input
                id="ollama-endpoint"
                value={localSettings.ollamaEndpoint || ''}
                onChange={(e) => updateSetting('ollamaEndpoint', e.target.value)}
                placeholder="http://localhost:11434"
                className="glass-input"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-accent-gradient">
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearAll}
              className="glass-input border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Clear All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}