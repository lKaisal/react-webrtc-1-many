import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import styles from './TextChat.module.scss';

interface TextChatProps {
  ws: WebSocket
}

const TextChat = ({ws}: TextChatProps): JSX.Element => {
  const [inputValue, setInputValue] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);

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
      sendMessage();
    }
  };

  function sendMessage() {
    if (!inputValue || !inputValue.length) {
      return;
    }
    ws.send(JSON.stringify({ action: 'MESSAGE', data: inputValue}));
    setInputValue('');
  }

  ws.onmessage = (message) => {
    const data = function() {
      try {
        return JSON.parse(message.data);
      } catch {
        return message.data;
      }
    }();
  
    if (data.action === 'MESSAGE') {
      const msg = data.data;
      setChatMessages([...chatMessages, msg]);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        {Boolean(chatMessages.length) && chatMessages.map((msg, index) => renderChatMessage({id: index, value: msg}))}
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
        <Button variant='contained' onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
};

export default TextChat;
