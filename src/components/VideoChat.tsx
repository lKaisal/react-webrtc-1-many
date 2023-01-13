import { useState, useRef, useEffect } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from './VideoChat.module.scss';

interface VideoChatProps {
  startCall: ({
    isCaller,
    roomId,
    id,
    friendId, 
    config
  }: {
    isCaller: boolean,
    roomId: string,
    id: string, 
    friendId: string, 
    config: {
      audio: boolean, 
      video: boolean
    }
  }) => void,
  endCall: ({isCaller, from}: {isCaller: boolean, from: string}) => void,
  roomId: string | null,
  id: string,
  localSrc: MediaStream | null,
  remoteSrc: PeerSrc[],
}

interface PeerSrc {
  id: string,
  stream: MediaStream,
}

const VideoChat = ({startCall, endCall, roomId, id, localSrc, remoteSrc}: VideoChatProps): JSX.Element => {
  const [friendId, setFriendId] = useState<string>('');
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    if (localVideo.current) {
      localVideo.current.srcObject = localSrc;
    }
  }, [localSrc]);

  useEffect(() => {
    remoteVideo.current = remoteVideo.current.slice(0, remoteSrc.length);

    remoteSrc.forEach((item, i) => {
      if (remoteVideo?.current[i]) {
        // remoteVideo.current[i].srcObject = item.stream;
      }
    })

    // console.log('remoteSrc');
    // console.log(remoteSrc);
    // console.log(remoteVideo);
  }, [remoteSrc]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setFriendId(newValue);
  }

  function onInputKeyUp(evt: React.KeyboardEvent<HTMLElement>) {
    const { key } = evt;
    if (key === 'Enter') {
      initCall();
    }
  };

  function initCall() {
    if (!friendId || !roomId) {
      return;
    }

    const config = { audio: false, video: true };
    
    startCall({roomId, isCaller: true, id, friendId, config});
  }

  function initEndCall() {
    endCall({isCaller: true, from: id});
    setFriendId('');
  }

  return (
    <div className={styles.root}>
      <Typography>Your id: {id}</Typography>
      <Typography>RoomId: {roomId}</Typography>
      <div className={styles.videoControls}>
        <div className={styles.chatInputWrapper}>
          <TextField
            label='id пользователя для звонка'
            variant='outlined'
            size='small'
            onChange={onInputChange}
            onKeyUp={onInputKeyUp}
            value={friendId}
          />
        </div>
        <Button variant='contained' onClick={initCall}>Call</Button>
        <Button variant='contained' onClick={initEndCall}>End call</Button>
      </div>
      <div className={styles.videos}>
        <div className={styles.videoWrapper}>
          <video id="localVideo" ref={localVideo} autoPlay></video>
        </div>
        <>
          {remoteSrc.map((item, i) => (
            <div key={i} className={styles.videoWrapper}>
              {<video id="remoteVideo" ref={ref => ref && remoteVideo.current.push(ref)} autoPlay></video>}
            </div>
          ))}
        </>
        
      </div>
    </div>
  )
}


export default VideoChat;