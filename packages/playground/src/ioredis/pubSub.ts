import Redis from 'ioredis';

// 接続は同時に両方の役割を果たすことはできないので、それぞれでインスタンスを作成する
const pubRedis = new Redis();
const subRedis = new Redis();

// 一定時間ごとにメッセージを送信する
setInterval(() => {
  const message = { foo: Math.random() };
  const channel = `my-channel-${1 + Math.round(Math.random())}`;

  pubRedis.publish(channel, JSON.stringify(message));
  console.log('Published %s to %s', message, channel);
}, 1000);

// 指定したチャンネルのsubscribeを実施する
subRedis.subscribe('my-channel-1', 'my-channel-2', (err, count) => {
  if (err) {
    console.error('Failed to subscribe: %s', err.message);
  } else {
    console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
  }
});
// subRedis.subscribe('my-channel-1');

// 設定されたsubscribeのメッセージを受信したら、コンソールに出力する
subRedis.on('message', (channel, message) => {
  console.log(`Received ${message} from ${channel}`);
});

// バッファとして受信することもできる。
// subRedis.on('messageBuffer', (channel, message) => {
//   // Both `channel` and `message` are buffers.
//   console.log(channel, message);
// });
