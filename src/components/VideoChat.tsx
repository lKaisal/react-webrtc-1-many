import { Button } from '@mui/material';
import styles from './VideoChat.module.scss';

function VideoChat() {
  function initCall() {
    //
  }

  return (
    <div className={styles.root}>
      <div className={styles.videoControls}>
        <Button variant='contained' onClick={initCall}>Call</Button>
      </div>
    </div>
  )
}

export default VideoChat;