import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import VideoChat from './components/VideoChat';
import TextChat from './components/TextChat';
import myWs from './ws';
import PeerConnection from './PeerConnection';
import styles from './App.module.scss';

function App() {
  const [clientId, setClientId] = useState<string>('');
  const [config, setConfig] = useState<{ audio: boolean, video: boolean }>({ audio: false, video: false});
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const [callWindowStatus, setCallWindowStatus] = useState<'active' | 'inactive'>('inactive');
  const [callModalStatus, setCallModalStatus] = useState<'active' | 'inactive'>('inactive');
  const [localSrc, setLocalSrc] = useState<MediaStream | null>(null);
  const [peerSrc, setPeerSrc] = useState<MediaStream | null>(null);

  useEffect(() => {
    const id = uuid();
    setClientId(id);
  }, [])

  function startCall({isCaller, friendId, config}: { 
    isCaller: boolean, 
    friendId: string, 
    config: {
      audio: boolean, 
      video: boolean
    } 
  }) {
    setConfig(config);
    // const pc: RTCPeerConnection = new PeerConnection({ friendId }).pc;
    const peerConnection = new PeerConnection({ friendId });
    peerConnection
      .on('localStream', (src) => {
        setCallWindowStatus('active');
        setLocalSrc(src);

        if (!isCaller) {
          setCallModalStatus('inactive');
        } else {
          setCallModalStatus('active');
        }
      })
      .on('peerStream', (src) => {
        setPeerSrc(src);
      })
      .start({ isCaller });

    const pc = peerConnection.pc;
    setPC(pc);
  }

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* <span id="status">Connecting...</span> */}
          <div className={styles.videoChat}>
            <VideoChat startCall={startCall} localSrc={localSrc} remoteSrc={peerSrc}/>
          </div>

          <div className={styles.textChat}>
            <TextChat ws={myWs}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
