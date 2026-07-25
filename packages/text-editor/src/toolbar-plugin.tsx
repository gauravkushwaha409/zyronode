import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@package/ui';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import React, { useCallback, useEffect, useState } from 'react';

interface ToolbarPluginProps {
  sendButtonProps?: React.ComponentProps<typeof Button>;
}

export function ToolbarPlugin({ sendButtonProps }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [editor, updateToolbar]);

  const handleBold = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
    [editor],
  );
  const handleItalic = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
    [editor],
  );
  const handleUnderline = useCallback(
    () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'),
    [editor],
  );
  const handleBulletList = useCallback(
    () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    [editor],
  );
  const handleNumberedList = useCallback(
    () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    [editor],
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        <Button
          icon="bold"
          size="icon-sm"
          variant={isBold ? 'default' : 'ghost'}
          onClick={handleBold}
        />
        <Button
          icon="italic"
          size="icon-sm"
          variant={isItalic ? 'default' : 'ghost'}
          onClick={handleItalic}
        />
        <Button
          icon="underline"
          size="icon-sm"
          variant={isUnderline ? 'default' : 'ghost'}
          onClick={handleUnderline}
        />
        <Button
          icon="bullet"
          size="icon-sm"
          variant="ghost"
          onClick={handleBulletList}
        />
        <Button
          icon="numbered-list"
          size="icon-sm"
          variant="ghost"
          onClick={handleNumberedList}
        />
        <Button icon="link" size="icon-sm" variant="ghost" />
      </div>
      <div className="flex items-center gap-x-2.5">
        <div className="flex items-center">
          <Button icon="formatting" size="icon-sm" variant="secondary" />
          <Button icon="audio" size="icon-sm" variant="ghost" />
          <Button icon="reply-menu" size="icon-sm" variant="ghost" />
        </div>
        <div className="">
          <Button icon="send" size="icon-sm" variant="default" {...sendButtonProps} />
        </div>
      </div>
    </div>
  );
}
