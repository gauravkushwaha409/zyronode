import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function useEditor() {
  const [editor] = useLexicalComposerContext();
  return editor;
}
