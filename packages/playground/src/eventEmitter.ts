// https://hireroo.io/journal/tech/implementing-event-emitter-with-typescript-for-beginner

type Callback = (payload: any) => void;

const createEventEmitter = () => {
  const callbackMap = new Map<string, Callback[]>();

  const on = (key: string, callback: Callback) => {
    const callbackList = callbackMap.get(key);

    if (callbackList) {
      callbackList.push(callback);
    } else {
      callbackMap.set(key, [callback]);
    }
  };

  const off = (key: string, callback: Callback) => {
    const callbackList = callbackMap.get(key);

    if (callbackList) {
      callbackMap.set(
        key,
        callbackList.filter((cb) => cb !== callback)
      );
    }
  };

  const emit = (key: string, payload: any) => {
    (callbackMap.get(key) || []).forEach((callback) => {
      callback(payload);
    });
  };

  return {
    on,
    off,
    emit,
  };
};

const myEventEmitter = createEventEmitter();

const showMessage = (payload: any) => {
  console.log({ message: 'showMessage', payload });
};

const showMessage2 = (payload: any) => {
  console.log({ message: 'showMessage2', payload });
};

// 登録
myEventEmitter.on('hello', showMessage);
myEventEmitter.on('hello', showMessage2);
myEventEmitter.on('?', showMessage);

// 実行
myEventEmitter.emit('hello', 'world');
myEventEmitter.emit('?', { message: '!' });

// 解除
myEventEmitter.off('?', showMessage);

// 再実行
myEventEmitter.emit('?', { message: '!' });
