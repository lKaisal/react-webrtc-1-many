import myWs from "../src/ws";
import MediaDevice from "./mediaDevice";

const PC_CONFIG = {};

const PeerConnection = ({friendId}: {friendId: string}) => {
  const pc = new RTCPeerConnection(PC_CONFIG);
  pc.onicecandidate = (evt) => {
    const { candidate } = evt;

    myWs.send(JSON.stringify({ action: 'call', data: {
      to: friendId,
      candidate,
    }}));
  }

  pc.ontrack = (evt) => {
    myWs.send(JSON.stringify({ action: 'peerStream', data: evt.streams[0] }))
  }

  // const mediaDevice = new MediaDevice();
}

export default PeerConnection;