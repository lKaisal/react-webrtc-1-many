import MediaDevice from "./MediaDevice";
import Emitter from "./Emitter";
import { default as ws } from "./ws";

const PC_CONFIG = {};

class PeerConnection extends Emitter {
  pc: RTCPeerConnection;
  mediaDevice: MediaDevice;
  id: string;
  friendId: string;

  constructor({ id, friendId }: { id: string, friendId: string }) {
    super();
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.pc.onicecandidate = (evt) => {
      ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
        evt: 'CALL_CANDIDATE',
        to: this.friendId,
        candidate: evt.candidate,
      } }))
    };
    this.pc.ontrack = (evt) => this.emit({ evt: 'peerStream', payload: evt.streams[0] });

    this.mediaDevice = new MediaDevice();
    this.id = id;
    this.friendId = friendId;
  }

  start({ isCaller }: { isCaller: boolean }) {
    this.mediaDevice
      .on('stream', (stream) => {
        stream.getTracks().forEach((track) => {
          this.pc.addTrack(track, stream);
        });
        this.emit({ evt: 'localStream', payload: stream });

        if (isCaller) {
          ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
            evt: 'REQUEST',
            to: this.friendId,
            from: this.id,
          } }))
        } else {
          this.createOffer();
        }
      })
      .start();
  }

  stop({ isCaller }: { isCaller: boolean }) {
    if (isCaller) {
      ws.send(JSON.stringify({ action: 'WEBRTC_MESSAGE', data: {
        evt: 'END',
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
            // ?????
            ws.send(JSON.stringify({action: 'WEBRTC_MESSAGE', data: {
              evt: 'CALL_OFFER',
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
            // ?????
            ws.send(JSON.stringify({action: 'WEBRTC_MESSAGE', data: {
              evt: 'CALL_OFFER',
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