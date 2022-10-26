import MediaDevice from "./MediaDevice";
import Emitter from "./Emitter";
import { default as ws } from "./ws";

const PC_CONFIG = {};

class PeerConnection extends Emitter {
  pc: RTCPeerConnection;
  mediaDevice: MediaDevice;
  friendId: string;

  constructor({ friendId }: { friendId: string }) {
    super();
    this.pc = new RTCPeerConnection(PC_CONFIG);
    this.pc.onicecandidate = (evt) => {
      ws.send(JSON.stringify({ action: 'call', data: {
        to: this.friendId,
        candidate: evt.candidate,
      } }))
    };
    this.pc.ontrack = (evt) => this.emit({ evt: 'peerStream', payload: evt.streams[0] });

    this.mediaDevice = new MediaDevice();
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
          ws.send(JSON.stringify({ action: 'request', data: {
            to: this.friendId,
          } }))
        } else {
          this.createOffer();
        }
      })
      .start();
  }

  stop({ isStarter }: { isStarter: boolean }) {
    if (isStarter) {
      ws.send(JSON.stringify({ evt: 'end', data: {
        to: this.friendId,
      } }));

      this.mediaDevice.stop();
      this.pc.close();
      this.off();

      return this;
    }
  }

  createOffer() {
    this.pc.createOffer()
      .then((offer) => {
        this.pc.setLocalDescription(offer);
      })
      .catch((err) => {
        console.error(err);
      });

    return this;
  }
}

export default PeerConnection;