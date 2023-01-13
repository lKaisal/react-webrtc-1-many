import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import styles from './ModalStart.module.scss';

interface ModalStartProps {
  isOpen: boolean,
  onClose: () => void,
  enterRoom: ({id}: {id: string | null}) => void,
}

const ModalStart = ({isOpen, onClose, enterRoom}: ModalStartProps): JSX.Element => {
  const [roomId, setRoomId] = useState<string>('');
  const [inputErrorShown, setInputErrorShown] = useState<boolean>(false);

  const modalStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(15px)',
  }

  const boxStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }
  
  function handleClose() {
    setInputErrorShown(false);
    onClose();
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setRoomId(newValue);
    setInputErrorShown(false);
  }

  function onInputKeyUp(evt: React.KeyboardEvent<HTMLElement>) {
    const { key } = evt;
    if (key === 'Enter') {
      enterExistingRoom();
    }
  };

  function enterExistingRoom() {
    if (!roomId) {
      setInputErrorShown(true);
      return;
    }

    enterRoom({id: roomId});
  }

  function enterNewRoom() {
    enterRoom({id: null});
  }

  return (
    <Modal
      sx={modalStyle}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={boxStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Войти в комнату
        </Typography>
        <div className={styles.existingRoomWrapper}>
          <div className={styles.inputWrapper}>
            <TextField
              label='id комнаты'
              variant='outlined'
              error={inputErrorShown}
              size='small'
              onChange={onInputChange}
              onKeyUp={onInputKeyUp}
              value={roomId}
            />
          </div>
          <Button variant='contained' onClick={enterExistingRoom}>Войти</Button>
        </div>
        <Button variant='contained' onClick={enterNewRoom}>Создать новую комнату</Button>
      </Box>
    </Modal>
  )
}

export default ModalStart;