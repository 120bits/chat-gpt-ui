import useStore from '@store/store';
import React, { useEffect, useState } from 'react';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import { MaxTokenSlider } from '../ConfigMenu/ConfigMenu';
import { shallow } from 'zustand/shallow';
import useDebounce from '@hooks/useDebounce';

export const QuickSettings = () => {
  const config = useStore(
    (state) =>
      state.chats &&
      state.chats.length > 0 &&
      state.currentChatIndex >= 0 &&
      state.currentChatIndex < state.chats.length
        ? state.chats[state.currentChatIndex].config
        : undefined,
    shallow,
  );
  if (!config) {
    return <div></div>;
  }
  const setChats = useStore((state) => state.setChats);
  const [_model, _setModel] = useState<ModelOptions>(config.model);
  const [_maxToken, _setMaxToken] = useState<number>(config.max_tokens);
  const currentChatIndex = useStore((state) => state.currentChatIndex);

  const setConfig = (config: ConfigInterface) => {
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats),
    );
    updatedChats[currentChatIndex].config = config;
    setChats(updatedChats);
  };

  const debouncedSetConfig = useDebounce(setConfig, 100);

  useEffect(() => {
    const newConfig = {
      ...config,
      max_tokens: _maxToken,
    };
    debouncedSetConfig(newConfig);
  }, [_maxToken]);


  return (
    <div>
      <MaxTokenSlider
        _maxToken={_maxToken}
        _setMaxToken={_setMaxToken}
        _model={_model}
      />
    </div>
  );
};