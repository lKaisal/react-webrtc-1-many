const PORT = 9000;
const URL = 'karpova123.site';
const myWs = new WebSocket(`wss://${URL}:${PORT}`);

export default myWs;