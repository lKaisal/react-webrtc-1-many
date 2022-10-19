import { useCallback } from "react";
import useEventDispatch from './useEventDispatch';

const MediaDevice = () => {
  const dispatchEvent = useEventDispatch();

  function start() {
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
        useCallback(() => {
          dispatchEvent('stream', stream);
        }, [dispatchEvent]);
      })
      .catch((err) => {
        if (err instanceof DOMException) {
          alert('Cannot open webcam and/or microphone');
        } else {
          console.log(err);
        }
      });
  }
}

export default MediaDevice;