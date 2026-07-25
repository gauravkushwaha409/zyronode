import {
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  useEditor,
} from '@package/text-editor';
import { useEffect } from 'react';

interface EnterToSendPluginProps {
  onSubmit: () => void;
}

export function EnterToSendPlugin({ onSubmit }: EnterToSendPluginProps) {
  const editor = useEditor();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onSubmit();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, onSubmit]);

  return null;
}
