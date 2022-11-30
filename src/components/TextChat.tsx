import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import styles from './TextChat.module.scss';

interface TextChatProps {
  messages: string[],
  sendMessage: ({msg}: {msg: string}) => void
}

const TextChat = ({messages, sendMessage}: TextChatProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  // const [chatMessages, setChatMessages] = useState<string[]>([]);

  const renderChatMessage = ({id, value}: {id: number, value: string}) => (
    <div key={id}>
      {value}
    </div>
  );

  function onChatInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setInputValue(newValue);
  }

  function onChatInputKeyUp(evt: React.KeyboardEvent<HTMLElement>) {
    const { key } = evt;
    if (key === 'Enter') {
      onClick();
    }
  };

  function onClick() {
    if (!inputValue || !inputValue.length) {
      return;
    }
    // ws.send(JSON.stringify({ action: 'MESSAGE', data: inputValue}));
    setInputValue('');
    sendMessage({msg: inputValue});
  }

  // ws.onmessage = (message) => {
  //   const data = function() {
  //     try {
  //       return JSON.parse(message.data);
  //     } catch {
  //       return message.data;
  //     }
  //   }();
  
  //   if (data.action === 'MESSAGE') {
  //     const msg = data.data;
  //     setChatMessages([...chatMessages, msg]);
  //   }
  // };

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        {Boolean(messages.length) && messages.map((msg, index) => renderChatMessage({id: index, value: msg}))}
      </div>
      <div className={styles.inputRow}>
        <div className={styles.chatInputWrapper}>
          <TextField
            variant='outlined'
            size='small'
            onChange={onChatInputChange}
            onKeyUp={onChatInputKeyUp}
            value={inputValue}
          />
        </div>
        <Button variant='contained' onClick={onClick}>Send</Button>
      </div>
    </div>
  )
};

export default TextChat;
