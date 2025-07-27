import { useState } from 'react'
import { Settings, Upload, Link, FileText, ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Agent {
  id: string
  name: string
  requiresUrl: boolean
  icon: string
}

interface AgentSelectorProps {
  agent: string
  url?: string
  onAgentChange: (agent: string) => void
  onUrlChange: (url: string) => void
}

const AGENTS: Agent[] = [
  { id: 'react', name: 'React Agent', requiresUrl: false, icon: '⚛️' },
  { id: 'youtube', name: 'YouTube', requiresUrl: true, icon: '📺' },
  { id: 'github', name: 'GitHub', requiresUrl: true, icon: '🐙' },
  { id: 'website', name: 'Website', requiresUrl: true, icon: '🌐' },
  { id: 'web-scroller', name: 'Web Scroller', requiresUrl: true, icon: '📜' },
  { id: 'docs', name: 'Docs', requiresUrl: false, icon: '📚' },
]

export function AgentSelector({ agent, url, onAgentChange, onUrlChange }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedAgent = AGENTS.find(a => a.id === agent) || AGENTS[0]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="glass-input w-full justify-between">
          <div className="flex items-center gap-2">
            <span>{selectedAgent.icon}</span>
            <span>{selectedAgent.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-3 mt-2">
        <div className="space-y-2">
          <Label>AI Agent</Label>
          <Select value={agent} onValueChange={onAgentChange}>
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              {AGENTS.map((agentOption) => (
                <SelectItem key={agentOption.id} value={agentOption.id}>
                  <div className="flex items-center gap-2">
                    <span>{agentOption.icon}</span>
                    <span>{agentOption.name}</span>
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
              value={url || ''}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://..."
              className="glass-input"
            />
          </div>
        )}

        {/* Document Upload (for Docs agent) */}
        {agent === 'docs' && (
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
      </CollapsibleContent>
    </Collapsible>
  )
}