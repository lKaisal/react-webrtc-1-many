import Emitter from './Emitter';

class MediaDevice extends Emitter {
  stream: MediaStream | null;
  
  constructor() {
    super();
    this.stream = null;
  }

  start() {
    const constraints = {
      video: {
        facingMode: 'user',
        height: { min: 360, ideal: 720, max: 1080 }
      },
      audio: true
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.stream = stream;
        this.emit({ evt: 'stream', payload: stream });
      })
      .catch((err) => {
        if (err instanceof DOMException) {
          alert('Cannot open webcam and/or microphone');
        } else {
          console.log(err);
        }
      });
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    return this;
  }

  toggle({ type, on }: { type: 'Audio' | 'Video', on?: boolean }) {
    if (this.stream) {
      this.stream[`get${type}Tracks`]().forEach((track) => {
        track.enabled = on !== undefined ? on : !track.enabled;
      });
    }

    return this;
  }
}

export default MediaDevice;