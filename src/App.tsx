import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import PeerConnection from './peerConnection';
import VideoChat from './components/VideoChat';
import TextChat from './components/TextChat';
import myWs from './ws';
import styles from './App.module.scss';

function App() {
  const [clientId, setClientId] = useState<string>('');
  const [config, setConfig] = useState<{ audio: boolean, video: boolean }>({ audio: false, video: false});
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const id = uuid();
    setClientId(id);
  }, [])

  function startCall({isCaller, friendId, config}: { 
    isCaller: Boolean, 
    friendId: Number, 
    config: {
      audio: boolean, 
      video: boolean
    } 
  }) {
    setConfig(config);
    setPC(new PeerConnection({friendId}));
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller);
  }

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* <span id="status">Connecting...</span> */}
          <div className={styles.videoChat}>
            <VideoChat startCall={startCall}/>
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
