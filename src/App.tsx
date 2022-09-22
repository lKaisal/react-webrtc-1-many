import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import VideoChat from './components/VideoChat';
import TextChat from './components/TextChat';
import styles from './App.module.scss';

const PORT = 9000;
const URL = 'karpova123.site';
const myWs = new WebSocket(`wss://${URL}:${PORT}`);

function App() {
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    const id = uuid();
    setClientId(id);
  }, [])

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* <span id="status">Connecting...</span> */}
          <div className={styles.videoChat}>
            <VideoChat/>
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
