import React, { useState } from 'react';
import useStore from '@store/store';

import ContentView from './View/ContentView';
import EditView from './View/EditView';
import ReactMarkdown from 'react-markdown';
import className = ReactMarkdown.propTypes.className;

const MessageContent = ({
  role,
  content,
  messageIndex,
  sticky = false,
}: {
  role: string;
  content: string;
  messageIndex: number;
  sticky?: boolean;
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(sticky);
  const advancedMode = useStore((state) => state.advancedMode);

  return (
    <div className='c-message__content relative flex flex-col lg:w-[calc(100%-115px)]'>
      {advancedMode && <div className='flex flex-grow flex-col gap-3'></div>}
      {isEdit ? (
        <EditView
          content={content}
          setIsEdit={setIsEdit}
          messageIndex={messageIndex}
          sticky={sticky}
        />
      ) : (
        <ContentView
          role={role}
          content={content}
          setIsEdit={setIsEdit}
          messageIndex={messageIndex}
        />
      )}
    </div>
  );
};

export default MessageContent;
