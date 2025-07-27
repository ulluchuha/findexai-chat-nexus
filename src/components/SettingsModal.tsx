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

interface SettingsModalProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o1-preview', name: 'o1 Preview' },
      { id: 'o1-mini', name: 'o1 Mini' }
    ]
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: [
      { id: 'flash-2.5', name: 'Flash 2.5' },
      { id: 'flash-2.5-lite', name: 'Flash 2.5 Lite' },
      { id: 'flash-2', name: 'Flash 2' },
      { id: 'pro', name: 'Pro' },
      { id: 'ultra', name: 'Ultra' }
    ]
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    models: [
      { id: 'opus-4', name: 'Claude 4 Opus' },
      { id: 'sonnet-4', name: 'Claude 4 Sonnet' },
      { id: 'haiku-3.5', name: 'Claude 3.5 Haiku' },
      { id: 'sonnet-3.5', name: 'Claude 3.5 Sonnet' }
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama',
    models: [
      { id: 'llama3.3', name: 'Llama 3.3' },
      { id: 'llama3.2', name: 'Llama 3.2' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'codellama', name: 'Code Llama' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'v3', name: 'DeepSeek V3' },
      { id: 'coder-v2', name: 'DeepSeek Coder V2' },
      { id: 'reasoning', name: 'DeepSeek Reasoning' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'auto', name: 'Auto (Best Available)' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'llama-70b', name: 'Llama 70B' }
    ]
  }
]

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const selectedProvider = PROVIDERS.find(p => p.id === localSettings.provider) || PROVIDERS[0]
  const selectedModel = selectedProvider.models.find(m => m.id === localSettings.model) || selectedProvider.models[0]

  const handleSave = () => {
    // Validate required API keys
    const providerKey = localSettings.apiKeys[localSettings.provider as keyof typeof localSettings.apiKeys]
    
    if (!providerKey && localSettings.provider !== 'ollama') {
      toast({
        title: "Missing API Key",
        description: `${selectedProvider.name} API key is required.`,
        variant: "destructive"
      })
      return
    }

    if (localSettings.provider === 'ollama' && !localSettings.endpoints.ollama) {
      toast({
        title: "Missing Endpoint",
        description: "Ollama endpoint URL is required.",
        variant: "destructive"
      })
      return
    }

    if (localSettings.provider === 'openrouter' && !localSettings.endpoints.openrouter) {
      toast({
        title: "Missing Endpoint",
        description: "OpenRouter endpoint URL is required.",
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
      provider: 'openai',
      model: 'gpt-4.1',
      apiKeys: {},
      endpoints: {}
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

  const updateEndpoint = (provider: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      endpoints: { ...prev.endpoints, [provider]: value }
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
          <DialogTitle className="gradient-text">Model & API Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={localSettings.provider}
              onValueChange={(value) => {
                updateSetting('provider', value)
                // Reset to first model of new provider
                const newProvider = PROVIDERS.find(p => p.id === value)
                if (newProvider) {
                  updateSetting('model', newProvider.models[0].id)
                }
              }}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => updateSetting('model', value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {selectedProvider.models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key Input */}
          {localSettings.provider !== 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor={`${localSettings.provider}-key`}>
                {selectedProvider.name} API Key
              </Label>
              <Input
                id={`${localSettings.provider}-key`}
                type="password"
                value={localSettings.apiKeys[localSettings.provider as keyof typeof localSettings.apiKeys] || ''}
                onChange={(e) => updateApiKey(localSettings.provider, e.target.value)}
                placeholder={
                  localSettings.provider === 'openai' ? 'sk-...' :
                  localSettings.provider === 'claude' ? 'sk-ant-...' :
                  localSettings.provider === 'gemini' ? 'AI...' :
                  localSettings.provider === 'deepseek' ? 'sk-...' :
                  localSettings.provider === 'openrouter' ? 'sk-or-...' : 'API Key'
                }
                className="glass-input"
              />
            </div>
          )}

          {/* Endpoint Inputs */}
          {localSettings.provider === 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
              <Input
                id="ollama-endpoint"
                value={localSettings.endpoints.ollama || ''}
                onChange={(e) => updateEndpoint('ollama', e.target.value)}
                placeholder="http://localhost:11434"
                className="glass-input"
              />
            </div>
          )}

          {localSettings.provider === 'openrouter' && (
            <div className="space-y-2">
              <Label htmlFor="openrouter-endpoint">OpenRouter Endpoint (Optional)</Label>
              <Input
                id="openrouter-endpoint"
                value={localSettings.endpoints.openrouter || ''}
                onChange={(e) => updateEndpoint('openrouter', e.target.value)}
                placeholder="https://openrouter.ai/api/v1"
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