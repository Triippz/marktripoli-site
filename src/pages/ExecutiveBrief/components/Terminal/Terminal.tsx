import { TerminalWindow } from './TerminalWindow';
import { useTerminal } from '../../hooks/useTerminal';
import type { TerminalProps } from '../../types/terminal';

export function Terminal({
  isOpen,
  onClose,
  fsRoot,
  resume,
  onTriggerAlert,
  onUnlockEasterEgg,
  onTriggerEgg
}: TerminalProps) {
  const terminal = useTerminal({
    fsRoot,
    resume,
    onTriggerAlert,
    onUnlockEasterEgg,
    onTriggerEgg
  });

  const handleClose = () => {
    terminal.close();
    onClose();
  };

  return (
    <TerminalWindow
      isOpen={isOpen}
      lines={terminal.lines}
      input={terminal.input}
      prompt={terminal.getPrompt()}
      placeholder="Enter command..."
      onInputChange={terminal.setInput}
      onExecuteCommand={terminal.executeCommand}
      onClose={handleClose}
    />
  );
}