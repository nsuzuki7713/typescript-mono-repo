function timerGame(callback: () => void) {
  console.log('Ready....go!');
  setTimeout(() => {
    console.log("Time's up -- stop!");
    callback && callback();
  }, 1000);
}

// フェイクタイマーを有効にしています。これは、setTimeout() やその他のタイマー関数の本来の実装を置き換える
jest.useFakeTimers();
const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

it('setTimeoutのモックに置き換えての確認', () => {
  timerGame(() => {
    /** do nothing */
  });

  expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
  expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});

it('すべてのタイマーを実行する', () => {
  const callback = jest.fn();
  timerGame(callback);

  expect(callback).not.toHaveBeenCalled();

  jest.runAllTimers();

  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledTimes(1);
});
