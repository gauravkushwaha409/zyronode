import { Children } from 'react';

interface InboxLayoutProps {
  children: React.ReactNode;
}

export function InboxLayout({ children }: InboxLayoutProps) {
  const [conversationList, conversation, conversationDetails] =
    Children.toArray(children);

  return (
    <div className="h-full w-full flex items-start rounded-[12px] bg-white shadow-sm pb-3">
      <div className="w-xl h-full border-r border-gray-200">
        {conversationList}
      </div>
      <div className="w-full h-full">{conversation}</div>
      <div className="w-md h-full border-l border-gray-200">
        {conversationDetails}
      </div>
    </div>
  );
}
