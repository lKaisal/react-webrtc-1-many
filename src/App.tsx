import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import VideoChat from './components/VideoChat';
import TextChat from './components/TextChat';
import ModalStart from './components/ModalStart';
import myWs from './ws';
import PeerConnection from './PeerConnection';
import styles from './App.module.scss';

interface PeerSrc {
  id: string,
  stream: MediaStream,
}

function App() {
  const [clientId, setClientId] = useState<string>('');
  const [config, setConfig] = useState<{ audio: boolean, video: boolean }>({ audio: false, video: false});
  const [pc, setPC] = useState<PeerConnection[]>([]);
  // const [friendId, setFriendId] = useState<string>('');
  const [localSrc, setLocalSrc] = useState<MediaStream | null>(null);
  const [peerSrc, setPeerSrc] = useState<PeerSrc[]>([]);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [modalStartOpen, setModalStartOpen] = useState<boolean>(true);
  const [roomId, setRoomId] = useState<string | null>(null);
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

      const { evt, to, from, roomId: remoteRoomId, stream } = data.data;

      if (!roomId || roomId !== remoteRoomId || from === clientId) {
        return;
      }

      if (evt === 'REQUEST_OUTGOING') {
        // if (!!pc) {
        //   return;
        // }

        // setFriendId(from);

        // startCall({ roomId, isCaller: false, id: clientId, friendId: from, config: { audio: false, video: true } });
        startIncoming({isCaller: true, roomId, id: clientId, from, stream});
        
        return;
      }

      if (evt === 'REQUEST_INCOMING') {
        startIncoming({isCaller: false, roomId, id: clientId, from, stream})
      }
    
      if (evt === 'REQUEST') {
        if (!!pc) {
          return;
        }

        // setFriendId(from);

        startCall({ roomId, isCaller: false, id: clientId, friendId: from, config: { audio: false, video: true } });
        // startIncoming({roomId, id: clientId, from, stream});
        
        return;
      }

      const currentPC = pc.find((p) => p.friendId === from);

      if (!currentPC) {
        return;
      }

      if (evt === 'CALL_OFFER') {
        debugger;
        const { sdp } = data.data;

        currentPC.pc.setRemoteDescription(sdp);

        if (sdp.type === 'offer') {
          currentPC.createAnswer();
        }

        return;
      }

      if (evt === 'CALL_CANDIDATE') {
        const { candidate } = data.data;

        if (candidate) {
          currentPC.pc.addIceCandidate(candidate);
        }
        
        return;
      }

      if (evt === 'END') {
        endCall({ isCaller: false, from });
      }
    };

    // myWs.send(JSON.stringify({action: 'END'}));
  }, [clientId, pc, chatMessages]);

  function closeModalStart() {
    setModalStartOpen(false);
  }

  function enterRoom({id}: {id: string | null}) {
    const isCaller = Boolean(id);
    const roomId = id || uuid();
    setRoomId(roomId);

    closeModalStart();

    // startCall({ roomId, isCaller, id: clientId, friendId: 'outgoing', config: { audio: false, video: true } });
    startOutgoing({roomId, id: clientId, config})
  }

  function sendChatMessage({msg} : {msg: string}) {
    myWs.send(JSON.stringify({ action: 'MESSAGE', data: msg}));
  }

  function startOutgoing({ roomId, id, config }: {
    roomId: string,
    id: string,
    config: {
      audio: boolean, 
      video: boolean
    }
  }) {
    setConfig(config);
    const friendId = 'outgoing';

    const peerConnection = new PeerConnection({ roomId, id, friendId, outgoingStream: null });
    peerConnection
      .on('localStream', (src) => {
        setLocalSrc(src);
      })
      .startOutgoing();

    // pc = peerConnection;
    setPC([...pc, peerConnection]);
  }

  function startIncoming({isCaller, roomId, id, from, stream}: {
    isCaller: boolean,
    roomId: string, 
    id: string,
    from: string,
    stream: MediaStream,
  }) {
    const currPC = pc.find((p) => p.friendId === from);

    if (Boolean(currPC)) {
      return;
    }

    const outgoingPC = pc.find((p) => p.friendId === 'outgoing');

    if (!outgoingPC?.stream) {
      return;
    }

    const peerConnection = new PeerConnection({ roomId, id, friendId: from, outgoingStream: outgoingPC.stream });

    if (!peerConnection) {
      return;
    }

    peerConnection
      .on('peerStream', (src) => {
        setPeerSrc([...peerSrc, { id: from, stream: src }]);
      })
      // .start({ isCaller });
      .startIncoming({isCaller})


    peerConnection.pc.onnegotiationneeded = (evt) => {
      debugger;
      // this.stream = evt.streams[0];
    }

    
    localSrc?.getTracks().forEach((track) => {
      console.log(track);
      peerConnection.pc.addTrack(track);
    })


    // setPeerSrc([...peerSrc, { id: from, stream }]);

    // pc = peerConnection;
    setPC([...pc, peerConnection]);
  }
  
  function startCall({roomId, isCaller, id, friendId, config}: { 
    roomId: string,
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
      // setFriendId(friendId);
    }

    // const pc: RTCPeerConnection = new PeerConnection({ friendId }).pc;

    const peerConnection = new PeerConnection({ roomId, id, friendId, outgoingStream: null });

    peerConnection
      .on('localStream', (src) => {
        setLocalSrc(src);
      })
      .on('peerStream', (src) => {
        setPeerSrc([...peerSrc, { id: friendId, stream: src }]);
      })
      .start({ isCaller });

    // pc = peerConnection;
    setPC([...pc, peerConnection]);
  }

  function endCall({ isCaller, from }: { isCaller: boolean, from: string }) {
    const currentPC = pc.find((p) => p.friendId === from);
    const currentIdx = currentPC && pc.indexOf(currentPC);

    if (!currentPC || !currentIdx) {
      return;
    }

    if (typeof currentPC?.stop === 'function') {
      currentPC.stop({ isCaller });
    }

    setPC([...pc.slice(0, currentIdx), ...pc.slice(currentIdx + 1, pc.length)]);
    // pc = null;

    // setConfig({ audio: false, video: false });
    // setLocalSrc(null);

    // setPeerSrc([]);
  }

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <div className={styles.content}>
          <ModalStart isOpen={modalStartOpen} onClose={closeModalStart} enterRoom={enterRoom}/>

          <div className={styles.videoChat}>
            <VideoChat 
              roomId={roomId}
              id={clientId}
              startCall={startCall}
              endCall={endCall}
              localSrc={localSrc}
              remoteSrc={peerSrc}/>
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
