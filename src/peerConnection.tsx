import MediaDevice from "./MediaDevice";
import Emitter from "./Emitter";
import { default as ws } from "./ws";

const PC_CONFIG = {};

class PeerConnection extends Emitter {
  pc: RTCPeerConnection;
  mediaDevice: MediaDevice;
  roomId: string;
  id: string;
  friendId: string;
  stream: MediaStream | null;
  outgoingStream: MediaStream | null;

  constructor({ roomId, id, friendId, outgoingStream }: { 
    roomId: string,
    id: string, 
    friendId: string,
    outgoingStream: MediaStream | null,
  }) {
    super();
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.pc.onicecandidate = (evt) => {
      debugger;
      ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
        evt: 'CALL_CANDIDATE',
        roomId: this.roomId,
        from: this.id,
        to: this.friendId,
        candidate: evt.candidate,
      } }))
    };
    this.pc.ontrack = (evt) => {
      debugger;
      this.emit({ evt: 'peerStream', payload: evt.streams[0] });
      // this.stream = evt.streams[0];
    }

    this.mediaDevice = new MediaDevice();
    this.roomId = roomId;
    this.id = id;
    this.friendId = friendId;
    this.stream = null;
    this.outgoingStream = outgoingStream;
  }

  start({ isCaller }: { isCaller: boolean }) {
    this.mediaDevice
      .on('stream', (stream) => {
        stream.getTracks().forEach((track) => {
          this.pc.addTrack(track, stream);
        });
        this.stream = stream;
        this.emit({ evt: 'localStream', payload: stream });

        if (isCaller) {
          ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
            evt: 'REQUEST',
            roomId: this.roomId,
            from: this.id,
            to: this.friendId,
            stream: this.outgoingStream,
          } }))
        } else {
          this.createOffer();
        }
      })
      .start();
  }

  startOutgoing() {
    this.mediaDevice
      .on('stream', (stream) => {
        stream.getTracks().forEach((track) => {
          this.pc.addTrack(track, stream);
        });
        this.stream = stream;
        this.emit({ evt: 'localStream', payload: stream });

        ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
          evt: 'REQUEST_OUTGOING',
          roomId: this.roomId,
          from: this.id,
          to: this.friendId,
        } }))
      })
      .start();
  }

  startIncoming({isCaller}: {isCaller: boolean}) {
    if (isCaller) {
      ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
        evt: 'REQUEST_INCOMING',
        roomId: this.roomId,
        from: this.id,
        to: this.friendId,
        stream: this.outgoingStream,
      } }))
    } else {
      this.createOffer();
    }
  }

  restart() {
    // this.mediaDevice.stop();
    // this.pc.close();
    this.start({isCaller: true});
  }

  stop({ isCaller }: { isCaller: boolean }) {
    if (isCaller) {
      ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
        evt: 'END',
        roomId: this.roomId,
        from: this.id,
        to: this.friendId,
      } }));
    }

    this.mediaDevice.stop();
    this.pc.close();
    this.off();

    return this;
  }

  createOffer() {
    this.pc.createOffer()
      .then((offer) => {
        this.pc.setLocalDescription(offer)
          .then(() => {
            debugger;
            ws.send(JSON.stringify({action: 'WEBRTC_MESSAGE', data: {
              evt: 'CALL_OFFER',
              roomId: this.roomId,
              from: this.id,
              to: this.friendId,
              sdp: offer,
            }}))
          })
      })
      .catch((err) => {
        console.error(err);
      });

    return this;
  }

  createAnswer() {
    this.pc.createAnswer()
      .then((offer) => {
        this.pc.setLocalDescription(offer)
          .then(() => {
            debugger;
            ws.send(JSON.stringify({action: 'WEBRTC_MESSAGE', data: {
              evt: 'CALL_OFFER',
              roomId: this.roomId,
              from: this.id,
              to: this.friendId,
              sdp: offer,
            }}))
          })
      })
      .catch((err) => {
        console.error(err);
      })
  }
}

export default PeerConnection;