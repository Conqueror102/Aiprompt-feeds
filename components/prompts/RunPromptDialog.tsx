// Component for the run prompt dialog
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AI_AGENTS } from '@/lib/constants'

interface RunPromptDialogProps {
  isOpen: boolean
  selectedAgent: string
  onAgentChange: (agent: string) => void
  onConfirm: () => void
  onCancel: () => void
  clipboardNotice?: string
}

export default function RunPromptDialog({
  isOpen,
  selectedAgent,
  onAgentChange,
  onConfirm,
  onCancel,
  clipboardNotice,
}: RunPromptDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run with AI</DialogTitle>
          <DialogDescription>Select an AI agent to run this prompt with.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Select value={selectedAgent} onValueChange={onAgentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="max-h-[300px]">
              <SelectItem value="none">Select AI</SelectItem>
              {AI_AGENTS.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {clipboardNotice && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm text-blue-700 dark:text-blue-300">
              ℹ️ {clipboardNotice}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={selectedAgent === 'none'}
              onClick={onConfirm}
            >
              Run
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
