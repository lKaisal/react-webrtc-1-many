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
  const [pc, setPC] = useState<PeerConnection | null>(null);
  const [fromId, setFromId] = useState<string>('');
  const [localSrc, setLocalSrc] = useState<MediaStream | null>(null);
  const [peerSrc, setPeerSrc] = useState<MediaStream | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  // let id: string;
  // let pc: PeerConnection | null;

  // const id = uuid();

  useEffect(() => {
    const id = uuid();
    setClientId(id);
  }, []);

  useEffect(() => {
    myWs.onmessage = (message) => {
      const data = function() {
        try {
          return JSON.parse(message.data);
        } catch {
          return message.data;
        }
      }();

      const { action } = data;
  
      if (action === 'MESSAGE') {
        const msg = data.data;
        setChatMessages([...chatMessages, msg]);
        return;
      }


      if (action !== 'WEBRTC_MESSAGE') {
        return;
      }

      const { evt, to, from } = data.data;

      if (to !== clientId || from === clientId) {
        return;
      }
    
      if (evt === 'REQUEST') {
        if (!!pc) {
          return;
        }

        setFromId(from);

        startCall({ isCaller: false, id: clientId, friendId: from, config: { audio: false, video: true } });
        
        return;
      }

      if (evt === 'CALL_OFFER') {
        if (!pc) {
          return;
        }

        const { sdp } = data.data;

        pc.pc.setRemoteDescription(sdp);

        if (sdp.type === 'offer') {
          pc.createAnswer();
        }

        return;
      }

      if (evt === 'CALL_CANDIDATE') {
        if (!pc) {
          return;
        }

        const { candidate } = data.data;

        if (candidate) {
          pc.pc.addIceCandidate(candidate);
        }
        
        return;
      }

      if (evt === 'END') {
        endCall({ isCaller: false });
      }
    };

    // myWs.send(JSON.stringify({action: 'END'}));
  }, [clientId, pc, chatMessages]);

  function sendChatMessage({msg} : {msg: string}) {
    myWs.send(JSON.stringify({ action: 'MESSAGE', data: msg}));
  }
  
  function startCall({isCaller, id, friendId, config}: { 
    isCaller: boolean, 
    id: string,
    friendId: string, 
    config: {
      audio: boolean, 
      video: boolean
    } 
  }) {
    setConfig(config);

    if (!isCaller) {
      setFromId(friendId);
    }

    // const pc: RTCPeerConnection = new PeerConnection({ friendId }).pc;
    const peerConnection = new PeerConnection({ id, friendId });
    peerConnection
      .on('localStream', (src) => {
        setLocalSrc(src);
      })
      .on('peerStream', (src) => {
        setPeerSrc(src);
      })
      .start({ isCaller });

    // pc = peerConnection;
    setPC(peerConnection);
  }

  function endCall({ isCaller }: { isCaller: boolean }) {
    if (typeof pc?.stop === 'function') {
      pc.stop({ isCaller });
    }

    setPC(null);
    // pc = null;
    setConfig({ audio: false, video: false });
    setLocalSrc(null);
    setPeerSrc(null);
  }

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* <span id="status">Connecting...</span> */}
          <div className={styles.videoChat}>
            <VideoChat id={clientId} startCall={startCall} endCall={endCall} localSrc={localSrc} remoteSrc={peerSrc}/>
          </div>

          <div className={styles.textChat}>
            <TextChat sendMessage={sendChatMessage} messages={chatMessages}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
